const { getIP } = require('./util')

const proxy = require('../../proxy')
const { BUILD } = require('../constant')

module.exports = function (hot, port, params = {}) {
  let obj = {
    contentBase: BUILD,
    host: getIP(),
    port: port,
    stats: {
      chunks: false,
      children: false,
      chunkModules: false,
      chunkOrigins: false,
      colors: true,
      errors: true,
      warnings: false
    },
    proxy: {}
  }
  if (hot) {
    obj.inline = true
    obj.hot = true
  }

  Object.keys(proxy).forEach(function (key) {
    const item = proxy[key]
    const wds = item.wds
    if (wds) {
      const prefix = `/${key}_wds`
      obj.proxy[prefix] = {
        target: wds.url,
        changeOrigin: true,
        secure: false,
        pathRewrite: { [`^${prefix}`]: '' }
      }
    }
  })
  return Object.assign(obj, params)
}
