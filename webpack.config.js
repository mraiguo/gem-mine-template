const KEYS = ['dev', 'polyfill', 'vendor', 'production']
const { MODE } = process.env
if (KEYS.indexOf(MODE) === -1) {
  throw new Error(`config ${MODE} not found`)
}

const config = require(`./config/webpack/${MODE}`)
module.exports = config
