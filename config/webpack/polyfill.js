const fs = require('fs-extra')
const { helper, BUILD, PUBLIC } = require('./helper')

const config = {
  entry: {
    polyfill: ['babel-polyfill']
  },
  output: helper.output.lib(),
  resolve: {
    extensions: ['.js']
  },
  module: {},
  plugins: [
    helper.plugins.uglify(),
    helper.plugins.done(function () {
      fs.copySync(`${PUBLIC}/polyfill-promise.js`, `${BUILD}/polyfill-promise.js`)
    })
  ]
}

module.exports = config
