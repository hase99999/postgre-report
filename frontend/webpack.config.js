const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js', // エントリーポイント
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'), // 出力ディレクトリ
    publicPath: '/', // 公開パス
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/i,
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
    fallback: {
      "stream": require.resolve("stream-browserify"),
      "timers": require.resolve("timers-browserify"),
    },
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