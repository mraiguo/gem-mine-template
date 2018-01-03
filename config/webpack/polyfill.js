const { helper, exec, BUILD, PUBLIC } = require('./helper')

const config = {
  entry: {
    polyfill: ['babel-polyfill']
  },
  output: helper.output.lib(),
  resolve: {
    extensions: ['', '.js']
  },
  module: {},
  plugins: [
    helper.plugins.uglify(),
    function () {
      this.plugin('done', function () {
        exec(`cp ${PUBLIC}/polyfill-promise.js ${BUILD}`)
      })
    }
  ]
}

module.exports = config
