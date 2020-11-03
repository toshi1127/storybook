export type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
};

export type PackageJsonWithDepsAndDevDeps = PackageJson &
  Required<Pick<PackageJson, 'dependencies' | 'devDependencies'>>;
