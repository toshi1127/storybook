import path from 'path';
import fse from 'fs-extra';
import { DefinePlugin } from 'webpack';
import Dotenv from 'dotenv-webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import PnpWebpackPlugin from 'pnp-webpack-plugin';
import VirtualModulePlugin from 'webpack-virtual-modules';
import TerserWebpackPlugin from 'terser-webpack-plugin';

import themingPaths from '@storybook/theming/paths';
import uiPaths from '@storybook/ui/paths';

import { version } from '../../../package.json';
import { getManagerHeadHtml } from '../utils/template';
import { loadEnv } from '../config/utils';

import babelLoader from './babel-loader-manager';
import { resolvePathInStorybookCache } from '../utils/resolve-path-in-sb-cache';
import es6Transpiler from '../common/es6Transpiler';

export default async ({
  configDir,
  configType,
  docsMode,
  entries,
  refs,
  outputDir,
  cache,
  previewUrl,
  versionCheck,
  releaseNotesData,
  presets,
}) => {
  const { raw, stringified } = loadEnv();
  const logLevel = await presets.apply('logLevel', undefined);
  const isProd = configType === 'PRODUCTION';
  const refsTemplate = fse.readFileSync(path.join(__dirname, 'virtualModuleRef.template.js'), {
    encoding: 'utf8',
  });

  return {
    name: 'manager',
    mode: isProd ? 'production' : 'development',
    bail: isProd,
    devtool: 'none',
    entry: entries,
    output: {
      path: outputDir,
      filename: '[name].[chunkhash].bundle.js',
      publicPath: '',
    },
    cache,
    plugins: [
      refs
        ? new VirtualModulePlugin({
            [path.resolve(path.join(configDir, `generated-refs.js`))]: refsTemplate.replace(
              `'{{refs}}'`,
              JSON.stringify(refs)
            ),
          })
        : null,
      new HtmlWebpackPlugin({
        filename: `index.html`,
        chunksSortMode: 'none',
        alwaysWriteToDisk: true,
        inject: false,
        templateParameters: (compilation, files, options) => ({
          compilation,
          files,
          options,
          version,
          globals: {
            CONFIG_TYPE: configType,
            LOGLEVEL: logLevel,
            VERSIONCHECK: JSON.stringify(versionCheck),
            RELEASE_NOTES_DATA: JSON.stringify(releaseNotesData),
            DOCS_MODE: docsMode, // global docs mode
            PREVIEW_URL: previewUrl, // global preview URL
          },
          headHtmlSnippet: getManagerHeadHtml(configDir, process.env),
        }),
        template: require.resolve(`../templates/index.ejs`),
      }),
      new CaseSensitivePathsPlugin(),
      new Dotenv({ silent: true }),
      // graphql sources check process variable
      new DefinePlugin({
        'process.env': stringified,
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      }),
    ].filter(Boolean),
    module: {
      rules: [
        babelLoader(),
        es6Transpiler(),
        {
          test: /\.css$/,
          use: [
            require.resolve('style-loader'),
            {
              loader: require.resolve('css-loader'),
              options: {
                importLoaders: 1,
              },
            },
          ],
        },
        {
          test: /\.(svg|ico|jpg|jpeg|png|apng|gif|eot|otf|webp|ttf|woff|woff2|cur|ani|pdf)(\?.*)?$/,
          loader: require.resolve('file-loader'),
          query: {
            name: 'static/media/[name].[hash:8].[ext]',
          },
        },
        {
          test: /\.(mp4|webm|wav|mp3|m4a|aac|oga)(\?.*)?$/,
          loader: require.resolve('url-loader'),
          query: {
            limit: 10000,
            name: 'static/media/[name].[hash:8].[ext]',
          },
        },
      ],
    },
    resolve: {
      extensions: ['.mjs', '.js', '.jsx', '.json', '.cjs', '.ts', '.tsx'],
      modules: ['node_modules'].concat(raw.NODE_PATH || []),
      alias: {
        ...themingPaths,
        ...uiPaths,
      },
      plugins: [
        // Transparently resolve packages via PnP when needed; noop otherwise
        PnpWebpackPlugin,
      ],
    },
    resolveLoader: {
      plugins: [PnpWebpackPlugin.moduleLoader(module)],
    },
    recordsPath: resolvePathInStorybookCache('public/records.json'),
    performance: {
      hints: false,
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
      },
      runtimeChunk: true,
      minimizer: isProd
        ? [
            new TerserWebpackPlugin({
              cache: true,
              parallel: true,
              sourceMap: true,
              terserOptions: {
                mangle: false,
                keep_fnames: true,
              },
            }),
          ]
        : [],
    },
  };
};
