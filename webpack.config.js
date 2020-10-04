const webpack = require('webpack');
const path = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
  entry: './app-entry.js',
  mode: isDevelopment ? 'development' : 'production',
  output: {
    filename: 'arlem.js',
    chunkFilename: 'arlem.[id].js',
    path: __dirname
  },
  optimization: {
    minimize: true
  },
  performance: {
    maxEntrypointSize: 500000,
    maxAssetSize: 1000000
  },
  plugins: [
    new webpack.ProvidePlugin({
    }),
    new webpack.DefinePlugin({
      APP_LAUNCH_DELAY: isDevelopment ? 100 : 0,
      IS_SOURCE: isDevelopment
    }),
    isDevelopment && new webpack.HotModuleReplacementPlugin(),
    isDevelopment && new ReactRefreshWebpackPlugin()
  ].filter(Boolean),
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [['@babel/preset-env', { targets: "defaults" }]],
          //presets: [ [ '@babel/preset-env', { targets: { "chrome": "81" } } ] ],
          //plugins: [ [ '@babel/plugin-transform-runtime', { corejs: 3 } ] ]
          plugins: [
            isDevelopment && require.resolve('react-refresh/babel')
          ].filter(Boolean)
        }
      }
    }, {
      test: /\.jsx$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [['@babel/preset-env', { targets: "defaults" }], '@babel/preset-react'],
          //presets: [ [ '@babel/preset-env', { targets: { "chrome": "81" } } ], '@babel/preset-react' ],
          //plugins: [ '@babel/transform-react-jsx', [ '@babel/plugin-transform-runtime', { corejs: 3 } ] ]
          plugins: [
            isDevelopment && require.resolve('react-refresh/babel')
          ].filter(Boolean)
        }
      }
    }]
  }
};
