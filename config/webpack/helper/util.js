const { readJSON } = require('gem-mine-helper')
const os = require('os')

exports.getConfig = function (path) {
  let config
  try {
    config = readJSON(path)
  } catch (e) {
    config = {}
  }
  return config
}

exports.join = function () {
  let result = []
  for (let i = 0; i < arguments.length; i++) {
    const value = arguments[i]
    if (value) {
      if (Array.isArray(value)) {
        result = result.concat(value)
      } else {
        result.push(value)
      }
    }
  }
  return result
}

exports.getIP = function () {
  let host = process.env.npm_config_host
  if (!host) {
    if (process.platform === 'win32') {
      const ns = os.networkInterfaces()
      const keys = Object.keys(ns)
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        const arr = ns[key]
        for (let j = 0; j < arr.length; j++) {
          if (arr[j].family === 'IPv4' && arr[j].internal === false) {
            host = arr[j].address
            break
          }
        }
        if (host) {
          break
        }
      }
      if (!host) {
        host = 'localhost'
      }
    } else {
      host = '0.0.0.0'
    }
  }
  return host
}
