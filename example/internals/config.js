/**
 * 基础配置
 */
const webpack = require('webpack')
const glob = require('glob')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const tsImportPluginFactory = require('ts-import-plugin')
const path = require('path').posix
const getEnviroment = require('./env')
const {
  root,
  context,
  dist,
  static,
  pageExt,
} = require('./path')
const pkg = require('../package.json')

module.exports = (env, argv) => {
  const isProduction = !!env.production
  const $ = (development, production) =>
    isProduction ? production : development
  const enviroments = getEnviroment(isProduction ? 'production' : 'development')

  const envConfig = $(require('./dev.config'), require('./prod.config'))(enviroments)

  const webpackConfig = {
    context,
    mode: $('development', 'production'),
    devtool: enviroments.raw.SOURCE_MAP === 'false' ? false : $('cheap-source-map', 'source-map'),
    entry: async () => {
        const ignores = getIgnore(enviroments.raw.IGNORE_ENTRIES)
        const pages = getPages(pageExt, ignores)
        const entries = {
          polyfill: require.resolve('./polyfill.js'),
          vendor: pkg.vendor || [],
        }
        pages.forEach(pagePath => {
          const fileName = path.basename(pagePath, pageExt)
          const entry = `./${fileName}.tsx`
          entries[fileName] = entry
        })

        return entries
      },
      output: {
        filename: `static/js/[name].js${$('', '?[hash:8]')}`,
        chunkFilename: `static/js/[name].js${$('', '?[hash:8]')}`,
        path: dist,
        pathinfo: true,
        publicPath: enviroments.raw.PUBLIC_URL,
      },
      resolve: {
        modules: ['node_modules'],
        extensions: ['.tsx', '.ts', '.js'],
        // 使用preact模式, 默认关闭，在生产环境存在一些问题
        alias: {
          // 可以直接使用@src访问相对于源代码目录的模块，优化查找效率
          // 如 @src/components/Button
          '@src': context,
          ...(enviroments.raw.USE_PREACT === 'true' ? {
            react: "preact-compat",
            "react-dom": "preact-compat"
          } : {})
        }
      },
      module: {
        rules: [{
          oneOf: [
            // typescript
            {
              test: /\.tsx?$/,
              use: [
                'cache-loader',
                {
                  loader: 'ts-loader',
                  options: Object.assign($({}, {
                    transpileOnly: true,
                    experimentalWatchApi: true,
                  }), {
                    getCustomTransformers: () => ({
                      before: [
                        tsImportPluginFactory([{
                            libraryName: 'antd',
                            libraryDirectory: 'lib',
                            style: 'css',
                          },
                          {
                            libraryName: '@gdjiami/rc-components',
                            libraryDirectory: 'lib',
                            style: 'css',
                          },
                        ]),
                      ],
                    }),
                  })
                }
              ],
              exclude: /node_modules/,
            },
            // pug loader
            {
              test: /\.pug$/,
              use: [
                'cache-loader',
                {
                  loader: 'pug-loader',
                  options: {
                    root: context,
                  },
                },
              ],
            },
            // svg sprite, 处理以.icon.svg结尾的svg文件
            {
              test: /\.icon\.svg$/,
              use: [
                'cache-loader',
                {
                  loader: 'svg-sprite-loader',
                  options: {
                    esModule: false,
                  },
                },
                'svgo-loader',
              ],
            },
            // images
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg/],
              loader: 'url-loader',
              options: {
                limit: 10000,
                name: `static/media/[name].[ext]${$('', '?[hash:8]')}`,
              },
            },
            ...(envConfig.rules || []),
            {
              // Exclude `js` files to keep "css" loader working as it injects
              // its runtime that would otherwise be processed through "file" loader.
              // Also exclude `html` and `json` extensions so they get processed
              // by webpacks internal loaders.
              exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
              loader: 'file-loader',
              options: {
                name: `static/media/[name].[ext]${$('', '?[hash:8]')}`,
              },
            },
          ],
        }, ],
      },
      optimization: {
        splitChunks: {
          name: true,
          cacheGroups: {
            // 第三方共有包
            vendor: {
              name: 'vendor',
              test: /node_modules/,
              reuseExistingChunk: false,
              chunks: 'initial',
              minChunks: 2,
              enforce: true, // 强制
              priority: 10,
            },
            // 应用内共有包
            commons: {
              test: /src/,
              name: 'commons',
              chunks: 'all',
              reuseExistingChunk: false,
              minChunks: 2,
              priority: 10,
            },
            default: false,
          },
        },
        ...(envConfig.optimization || {}),
      },
      plugins: [
        // 移除moment语言包
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        new webpack.DefinePlugin(enviroments.stringified),
        ...genTemplatePlugin(isProduction, enviroments.raw),
        ...(envConfig.plugins || []),
      ],
      devServer: envConfig.devServer,
      performance: envConfig.performance,
  }

  return webpackConfig
}

function getPages(ext, ignores) {
  ignores = ignores || []
  return glob.sync(path.join(context, `*${ext}`), {
    ignore: ignores,
  })
}

// 生成*.html 文件
function genTemplatePlugin(isProduction, templateParameters, ext) {
  ext = ext || pageExt
  const ignores = getIgnore(templateParameters.IGNORE_ENTRIES)
  const pages = getPages(ext, ignores)
  return pages.map(pagePath => {
    const name = path.basename(pagePath, ext)
    const filename = path.basename(pagePath, ext)
    return new HtmlWebpackPlugin({
      templateParameters,
      filename: filename + '.html',
      inject: true,
      chunks: ['polyfill', 'vendor', 'commons', name],
      template: pagePath,
      minify: isProduction ? {
        removeAttributeQuotes: true,
        removeComments: true,
        collapseWhitespace: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
      } : undefined,
    })
  })
}

function getIgnore(ignores) {
  if (ignores == null || ignores === '') {
    return []
  }
  return ignores.split(',')
}