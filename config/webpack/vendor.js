const path = require('path')
const { BUILD } = require('./constant')
const { helper, copyFileToDist, join } = require('./helper')
const cfg = require('../webpack')

const production = process.env.MODE === 'production'

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
    helper.plugins.define('production'),
    helper.plugins.dll(),
    production ? helper.plugins.uglify() : undefined,
    helper.plugins.done(function () {
      copyFileToDist(path.resolve(BUILD, 'vendor.js'), BUILD, true, cfg.staticHash)
    })
  )
}

module.exports = config
