/* eslint-disable @typescript-eslint/no-var-requires */
const { registerAllRouter } = require('./backend/lib/main')
const path = require('path')

const resolve = (...paths) => path.join(__dirname, ...paths)

module.exports = {
  devServer: {
    before (app) {
      registerAllRouter(app)
    }
  },
  // configureWebpack: (config) => {
  //   if (process.env.npm_config_report) {
  //     const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  //     config.plugins.push(new BundleAnalyzerPlugin())
  //   }
  // },
  chainWebpack: config => {
    config.module.rules.delete('svg')
    config.module.rule('svg').exclude.add(resolve('src/assets/icons')).end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/assets/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()
  },
  productionSourceMap: false,
  publicPath: process.env.NODE_ENV === 'production' ? '/music-next/' : '/'
}
