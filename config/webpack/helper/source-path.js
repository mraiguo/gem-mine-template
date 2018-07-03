const { CDN } = require('../constant')

exports.getPublicPath = function (config) {
  let publicPath
  if (CDN) {
    publicPath = `${config.cdn.host.replace(/\/+$/, '')}/${config.cdn.params.path
      .replace(/^\//, '')
      .replace(/\/+$/, '')}/`
  } else {
    publicPath = config.publicPath
  }
  return publicPath
}

exports.getPublicPathInHTML = function (isDev, publicPath) {
  return isDev ? '' : publicPath
}
