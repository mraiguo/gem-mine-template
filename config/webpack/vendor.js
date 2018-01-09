const path = require('path')
const fs = require('fs-extra')
const { helper, PUBLIC, BUILD, setFileVersion } = require('./helper')
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
    function () {
      this.plugin('done', function () {
        const dist = path.resolve(BUILD, 'vendor.js')
        setFileVersion(dist)

        if (cfg.additional) {
          cfg.additional.forEach(function (name) {
            fs.copySync(`${PUBLIC}/${name}`, `${BUILD}/${name}`)
          })
        }
      })
    }
  ]
}

module.exports = config
