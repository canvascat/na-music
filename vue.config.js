/* eslint-disable @typescript-eslint/no-var-requires */
const { registerAllRouter } = require('./backend/lib/main')

module.exports = {
  devServer: {
    before (app) {
      registerAllRouter(app)
    }
  },
  configureWebpack: (config) => {
    if (process.env.npm_config_report) {
      const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
      config.plugins.push(new BundleAnalyzerPlugin())
    }
  },
  productionSourceMap: false,
  publicPath: process.env.NODE_ENV === 'production' ? '/music-next/' : '/'
}
