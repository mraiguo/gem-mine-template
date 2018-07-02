const { BUILD } = require('../constant')
const config = require('../../webpack')
const { getPublicPath } = require('./source-path')

const publicPath = getPublicPath(config)
const { MODE } = process.env
const isDev = MODE === 'dev'
const SOURCE_IN_HTML_PUBLIC_PATH = isDev ? '' : publicPath

module.exports = {
  // for dev/production
  hash: function (params = {}) {
    return Object.assign(
      {
        path: BUILD,
        filename: `[name]${config.staticHash ? '-[hash]' : ''}.js`,
        chunkFilename: `[name].[chunkhash].js`,
        publicPath: SOURCE_IN_HTML_PUBLIC_PATH
      },
      params
    )
  },
  // for vendor/polyfill
  lib: function (params = {}) {
    return Object.assign(
      {
        path: BUILD,
        filename: '[name].js',
        library: '[name]'
      },
      params
    )
  }
}
