const { readJsonSync, writeJsonSync } = require('fs-extra')
const os = require('os')
const { exec } = require('./cmd')

exports.readJSON = readJsonSync
exports.writeJSON = function (path, object) {
  return writeJsonSync(path, object, {
    spaces: 2
  })
}

exports.getIn = function (obj, path) {
  let result = obj
  if (path) {
    const arr = path.split('.')
    for (let i = 0; i < arr.length; i += 1) {
      const key = arr[i].trim()
      if (result === undefined) {
        return result
      }
      result = result[key]
    }
  }
  return result
}

exports.getConfig = function (path) {
  let config
  try {
    config = readJsonSync(path)
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

exports.checkNpmRegistry = function () {
  const registry = exec('npm config get registry', false)
  if (registry.indexOf('registry.npmjs.org') > -1) {
    exec('npm config set registry https://registry.npm.taobao.org')
  }
}
