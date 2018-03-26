const path = require('path')
const { BUILD, PUBLIC } = require('./constant')
const { helper, copyFileToDist, join } = require('./helper')
const cfg = require('../webpack')

const isDev = process.env.isDev === 'true'

const config = {
  entry: {
    polyfill: ['babel-polyfill']
  },
  output: helper.output.lib(),
  resolve: {
    extensions: ['.js']
  },
  module: {},
  plugins: join(
    isDev ? undefined : helper.plugins.uglify(),
    helper.plugins.done(function () {
      copyFileToDist(path.resolve(BUILD, 'polyfill.js'), BUILD, true, cfg.staticHash)
      copyFileToDist(path.resolve(PUBLIC, 'polyfill-promise.js'), BUILD, false, cfg.staticHash)
    })
  )
}

module.exports = config
