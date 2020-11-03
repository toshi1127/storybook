import chalk from 'chalk';
import { gt, satisfies } from '@storybook/semver';
import { sync as spawnSync } from 'cross-spawn';
import { commandLog } from '../helpers';
import { PackageJson, PackageJsonWithDepsAndDevDeps } from './PackageJson';
import { readPackageJson, writePackageJson } from './PackageJsonHelper';

const logger = console;
// Cannot be `import` as it's not under TS root dir
const storybookPackagesVersions = require('../../versions.json');

export abstract class JsPackageManager {
  public abstract readonly type: 'npm' | 'yarn1' | 'yarn2';

  public abstract initPackageJson(): void;

  public abstract getRunStorybookCommand(): string;

  public abstract getRunCommand(command: string): string;

  /**
   * Install dependencies listed in `package.json`
   */
  public installDependencies(): void {
    let done = commandLog('Preparing to install dependencies');
    done();
    logger.log();

    logger.log();
    done = commandLog('Installing dependencies');

    try {
      this.runInstall();
    } catch (e) {
      done('An error occurred while installing dependencies.');
      process.exit(1);
    }
    done();
  }

  public retrievePackageJson(): PackageJsonWithDepsAndDevDeps {
    let packageJson = readPackageJson();
    if (!packageJson) {
      // It will create a new package.json file
      this.initPackageJson();

      // read the newly created package.json file
      packageJson = readPackageJson() || {};
    }

    return {
      ...packageJson,
      dependencies: { ...packageJson.dependencies },
      devDependencies: { ...packageJson.devDependencies },
    };
  }

  /**
   * Add dependencies to a project using `yarn add` or `npm install`.
   *
   * @param {Object} options contains `skipInstall`, `packageJson` and `installAsDevDependencies` which we use to determine how we install packages.
   * @param {Array} dependencies contains a list of packages to add.
   * @example
   * addDependencies(options, [
   *   `@storybook/react@${storybookVersion}`,
   *   `@storybook/addon-actions@${actionsVersion}`,
   *   `@storybook/addon-links@${linksVersion}`,
   *   `@storybook/addons@${addonsVersion}`,
   * ]);
   */
  public addDependencies(
    options: {
      skipInstall?: boolean;
      installAsDevDependencies?: boolean;
      packageJson?: PackageJson;
    },
    dependencies: string[]
  ): void {
    const { skipInstall } = options;

    if (skipInstall) {
      const { packageJson } = options;

      const dependenciesMap = dependencies.reduce((acc, dep) => {
        const idx = dep.lastIndexOf('@');
        const packageName = dep.slice(0, idx);
        const packageVersion = dep.slice(idx + 1);

        return { ...acc, [packageName]: packageVersion };
      }, {});

      if (options.installAsDevDependencies) {
        packageJson.devDependencies = {
          ...packageJson.devDependencies,
          ...dependenciesMap,
        };
      } else {
        packageJson.dependencies = {
          ...packageJson.dependencies,
          ...dependenciesMap,
        };
      }

      writePackageJson(packageJson);
    } else {
      try {
        this.runAddDeps(dependencies, options.installAsDevDependencies);
      } catch (e) {
        logger.error('An error occurred while installing dependencies.');
        logger.log(e.message);
        process.exit(1);
      }
    }
  }

  /**
   * Return an array of strings matching following format: `<package_name>@<package_latest_version>`
   *
   * @param packageNames
   */
  public getVersionedPackages(...packageNames: string[]): Promise<string[]> {
    return Promise.all(
      packageNames.map(
        async (packageName) => `${packageName}@${await this.getVersion(packageName)}`
      )
    );
  }

  /**
   * Return an array of string standing for the latest version of the input packages.
   * To be able to identify which version goes with which package the order of the input array is keep.
   *
   * @param packageNames
   */
  public getVersions(...packageNames: string[]): Promise<string[]> {
    return Promise.all(packageNames.map((packageName) => this.getVersion(packageName)));
  }

  public async getVersion(packageName: string, constraint?: string): Promise<string> {
    let current;

    if (/@storybook/.test(packageName)) {
      current = storybookPackagesVersions[packageName];
    }

    let latest;
    try {
      latest = await this.latestVersion(packageName, constraint);
    } catch (e) {
      if (current) {
        logger.warn(`\n     ${chalk.yellow(e.message)}`);
        return current;
      }

      logger.error(`\n     ${chalk.red(e.message)}`);
      process.exit(1);
    }

    const versionToUse =
      current && (!constraint || satisfies(current, constraint)) && gt(current, latest)
        ? current
        : latest;
    return `^${versionToUse}`;
  }

  /**
   * Get the latest version of the package available on npmjs.com.
   * If constraint is set then it returns a version satisfying it, otherwise the latest version available is returned.
   *
   * @param packageName Name of the package
   * @param constraint Version range to use to constraint the returned version
   */
  public async latestVersion(packageName: string, constraint?: string): Promise<string> {
    if (!constraint) {
      return this.runGetVersions(packageName, false);
    }

    const versions = await this.runGetVersions(packageName, true);

    // Get the latest version satisfying the constraint
    return versions.reverse().find((version) => satisfies(version, constraint));
  }

  public addStorybookCommandInScripts(options?: {
    port: number;
    staticFolder?: string;
    preCommand?: string;
  }) {
    const sbPort = options?.port ?? 6006;
    const noDll = '--no-dll';
    const storybookCmd = options?.staticFolder
      ? `start-storybook -p ${sbPort} -s ${options.staticFolder} ${noDll}`
      : `start-storybook -p ${sbPort} ${noDll}`;

    const buildStorybookCmd = options?.staticFolder
      ? `build-storybook -s ${options.staticFolder} ${noDll}`
      : `build-storybook ${noDll}`;

    const preCommand = options.preCommand ? this.getRunCommand(options.preCommand) : undefined;
    this.addScripts({
      storybook: [preCommand, storybookCmd].filter(Boolean).join(' && '),
      'build-storybook': [preCommand, buildStorybookCmd].filter(Boolean).join(' && '),
    });
  }

  public addScripts(scripts: Record<string, string>) {
    const packageJson = this.retrievePackageJson();
    writePackageJson({
      ...packageJson,
      scripts: {
        ...packageJson.scripts,
        ...scripts,
      },
    });
  }

  protected abstract runInstall(): void;

  protected abstract runAddDeps(dependencies: string[], installAsDevDependencies: boolean): void;

  /**
   * Get the latest or all versions of the input package available on npmjs.com
   *
   * @param packageName Name of the package
   * @param fetchAllVersions Should return
   */
  protected abstract runGetVersions<T extends boolean>(
    packageName: string,
    fetchAllVersions: T
  ): // Use generic and conditional type to force `string[]` if fetchAllVersions is true and `string` if false
  Promise<T extends true ? string[] : string>;

  public executeCommand(command: string, args: string[], stdio?: 'pipe' | 'inherit'): string {
    const commandResult = spawnSync(command, args, {
      stdio: stdio ?? 'pipe',
      encoding: 'utf-8',
    });

    if (commandResult.status !== 0) {
      throw new Error(commandResult.stderr ?? '');
    }

    return commandResult.stdout ?? '';
  }
}
