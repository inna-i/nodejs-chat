const path = require('path');
const webpackNodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node',
  entry: './index.js',
  output: {
    filename: 'server.js',
    path: path.resolve(__dirname, 'build'),
    //publicPath: '/build',
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      use: ['babel-loader']
    }]
  },
  optimization: {
    // We no not want to minimize our code.
    minimize: false
  },
  externals: [webpackNodeExternals()]
}