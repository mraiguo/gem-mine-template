const path = require('path')
const { BUILD } = require('./constant')
const { helper, copyFileToDist, join } = require('./helper')
const cfg = require('../webpack')

const isDev = process.env.isDev === 'true'

const config = {
  entry: {
    vendor: ['react', 'react-dom', 'cat-eye'].concat(cfg.vendor)
  },
  output: helper.output.lib(),
  resolve: helper.resolve(),
  resolveLoader: helper.resolveLoader(),
  module: {
    loaders: [helper.loaders.babel()],
    postLoaders: [helper.loaders.es3ify()]
  },
  plugins: join(
    helper.plugins.define(isDev ? 'dev' : 'production'),
    helper.plugins.dll(),
    isDev ? undefined : helper.plugins.uglify(),
    helper.plugins.done(function () {
      copyFileToDist(path.resolve(BUILD, 'vendor.js'), BUILD, true, cfg.staticHash)
    })
  )
}

module.exports = config
