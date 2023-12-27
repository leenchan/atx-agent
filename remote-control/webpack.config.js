const path = require('path');
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
  mode: isDevelopment ? 'development' : 'production',
  devtool: 'eval-source-map',
  devServer: {
    client: { overlay: false },
  },
  entry: {
    main: './src/index.js',
  },
  // output: {
  //   filename: '[name].bundle.js',
  //   path: path.resolve(__dirname, 'dist'),
  //   clean: true,
  // },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: path.join(__dirname, 'src'),
        use: 'babel-loader',
      },
    ],
  },
  plugins: [
    isDevelopment && new ReactRefreshPlugin(),
    new HtmlWebpackPlugin({
      filename: './remote-control.html',
      template: './public/remote-control.html',
    }),
  ].filter(Boolean),
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@ui': path.resolve(__dirname, 'src/lib/ui'),
      '@theme': path.resolve(__dirname, 'src/lib/theme'),
      '@api': path.resolve(__dirname, 'src/lib/api'),
      '@component': path.resolve(__dirname, 'src/component'),
      '@util': path.resolve(__dirname, 'src/lib/util'),
      '@hook': path.resolve(__dirname, 'src/lib/hook'),
    },
  },
};