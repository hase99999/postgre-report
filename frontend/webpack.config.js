// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js', // エントリーポイント
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, // JavaScriptとJSXファイルを処理
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/, // CSSファイルを処理
        use: ['style-loader', 'css-loader'],
      },
      // 必要に応じて他のローダーも追加
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html', // テンプレートパス
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx'], // 解決する拡張子
  },
  devServer: {
    port: 3000, // ポートをここに指定
    static: {
      directory: path.join(__dirname, 'public'),
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // バックエンドサーバーのURL
        changeOrigin: true,
        secure: false,
      },
    },
    historyApiFallback: true,
  },
  mode: 'development',
};