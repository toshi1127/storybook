const packageJson = require('../../package.json');

export default {
  packageJson,
  framework: 'angular',
  frameworkPresets: [
    require.resolve('./framework-preset-angular.js'),
    require.resolve('./framework-preset-angular-cli.js'),
  ],
};
