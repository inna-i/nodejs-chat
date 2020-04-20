const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const clientConfig = require('./webpack.client');

const config = {
  ...clientConfig,
  devServer: {
    port: 8080,
    historyApiFallback: true,
    proxy: {
      '/api': 'http://localhost:8081',
      //'/socket.io': 'http://localhost:8081',
      '/socket.io': {
        target: 'http://localhost:8081',
        ws: true
     }
    }
  },
}

config.output.publicPath = undefined;

module.exports = config