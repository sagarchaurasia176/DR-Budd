const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
require('dotenv').config();

module.exports = {
  mode: 'production',

  entry: {
    main: './src/main.tsx',
    content: './src/content.tsx',
    background: './src/background.ts',
    styles: './styles.css',
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },

  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    port: 3000,
    open: true,
    hot: true,
    compress: true,
    historyApiFallback: true,
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|mp3)$/i,  // Added mp3 to asset loader
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name][ext]',  // Changed to assets folder
        },
      },
    ],
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new CopyPlugin({
      patterns: [
        { from: 'public', to: '.' },  // Changed to copy all public files
        { from: 'manifest.json', to: '.' },
        { from: 'icons', to: 'icons' },
        { from: 'src/assets/notification.mp3', to: 'assets/notification.mp3' }  // Moved inside CopyPlugin
      ],
    }),
  ],

  devtool: 'source-map',
};