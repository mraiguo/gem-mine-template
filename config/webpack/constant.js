const path = require('path')
const config = require('../webpack')

const ROOT = path.resolve(__dirname, '../../')
const NM = 'node_modules'
const NODE_MODULES = path.resolve(ROOT, NM)
const SRC = path.resolve(ROOT, 'src')
const BUILD = config.buildPath || path.resolve(ROOT, 'build')
const PUBLIC = path.resolve(ROOT, 'public')
const CONFIG = path.resolve(ROOT, 'config')
const STYLE = path.resolve(SRC, 'styles')

let CDN = false
// 使用 --cdn 或者 env 在 cdnEnv 中，则启用 cdn 功能
if (config.cdn) {
  if (!!process.env.npm_config_cdn || (config.cdn.env && config.cdn.env.indexOf(process.env.npm_config_env) > -1)) {
    CDN = true
  }
}

exports.ROOT = ROOT
exports.NODE_MODULES = NODE_MODULES
exports.SRC = SRC
exports.BUILD = BUILD
exports.PUBLIC = PUBLIC
exports.CONFIG = CONFIG
exports.STYLE = STYLE
exports.CDN = CDN
