/**
 * 开发环境配置
 */
const webpack = require('webpack')
const {
  root,
  context,
  dist,
  static
} = require('./path')
const proxy = require('../proxy.json')

module.exports = (enviroments) => ({
  rules: [{
    test: /\.css$/,
    use: [
      'style-loader',
      {
        loader: 'css-loader',
        options: {
          importLoaders: 1,
        },
      },
      {
        loader: 'postcss-loader',
        options: {
          ident: 'postcss',
          plugins: () => [
            require('autoprefixer')({
              browsers: ['last 2 versions'],
            }),
          ],
        },
      },
    ],
  }, ],
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],
  devServer: {
    contentBase: [static, dist],
    compress: false,
    hot: true,
    overlay: true,
    host: '0.0.0.0',
    port: enviroments.raw.PORT || '8080',
    https: enviroments.raw.https === 'true',
    proxy: proxy,
  },
})