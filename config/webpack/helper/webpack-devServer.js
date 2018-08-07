const { log } = require('gem-mine-helper')
const anyBody = require('body/any')
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
      log.warning(`开启了代理请求，匹配前缀：${prefix} 请求将会被转发到：${wds.url}`)
      obj.proxy[prefix] = {
        target: wds.url,
        changeOrigin: true,
        secure: false,
        pathRewrite: { [`^${prefix}`]: '' },
        onProxyReq: function (proxyReq, req, res) {
          const method = req.method.toUpperCase()
          log.warning(`收到请求 ${method}: http://${req.headers.host}${req.originalUrl} -> ${wds.url}${req.url}`)
          console.log('header: ', JSON.stringify(req.headers))
          anyBody(req, res, function (err, body) {
            if (err) {
            }
            if (['POST', 'PUT', 'DELETE'].indexOf(method) > -1) {
              console.log('body: ', JSON.stringify(body))
            }
          })
        }
      }
    }
  })
  return Object.assign(obj, params)
}
