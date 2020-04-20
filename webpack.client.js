 
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/client.js',
  output: {
    filename: 'client_bundle.js',
    path: path.resolve(__dirname, 'build/public'),
   // publicPath: '/build/public',
  },
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      use: ['babel-loader']
    }]
  },
  plugins: [new HtmlWebpackPlugin()]
}