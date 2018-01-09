const path = require('path')
const { helper, BUILD, setFileVersion } = require('./helper')
const cfg = require('../webpack')

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
  plugins: [
    helper.plugins.define('production'),
    helper.plugins.dll(),
    helper.plugins.uglify(),
    helper.plugins.done(function () {
      const dist = path.resolve(BUILD, 'vendor.js')
      setFileVersion(dist)
    })
  ]
}

module.exports = config
