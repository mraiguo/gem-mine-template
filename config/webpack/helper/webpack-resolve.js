const path = require('path')
const config = require('../../webpack')
const { NODE_MODULES, SRC, CONFIG } = require('../constant')

module.exports = {
  resolve: function () {
    const params = config.resolve || {}
    const obj = {
      modules: [NODE_MODULES],
      extensions: ['.js', '.jsx', '.css', '.less', '.scss'],
      alias: {
        config: CONFIG,
        components: path.resolve(SRC, 'components'),
        styles: path.resolve(SRC, 'styles'),
        global: path.resolve(SRC, 'global'),
        'fish-mobile': '@sdp.nd/fish-mobile'
      }
    }
    if (params.extensions) {
      obj.extensions = obj.extensions.concat(params.extensions)
    }
    if (params.alias) {
      obj.alias = Object.assign(obj.alias, params.alias)
    }
    Object.keys(params).forEach(key => {
      if (!obj[key]) {
        obj[key] = params[key]
      }
    })
    return obj
  },

  resolveLoader: function (params = {}) {
    return Object.assign(
      {
        modules: [NODE_MODULES]
      },
      params
    )
  }
}
