const path = require('path')
const { clean, copyFileToDist } = require('./file')
const print = require('./print')
const { exec } = require('./cmd')
const { readJSON, join, checkNpmRegistry } = require('./util')
const { BUILD } = require('../constant')

const output = require('./webpack-output')
const loaders = require('./webpack-loaders')
const plugins = require('./webpack-plugins')
const { resolve, resolveLoader } = require('./webpack-resolve')
const devServer = require('./webpack-devServer')

const { MODE } = process.env
const isDev = MODE === 'dev'

checkNpmRegistry()

exports.preBuild = function () {
  clean({ dist: BUILD })
  let files

  print.info('build polyfill && vendor')
  const env = Object.assign({}, process.env, {
    isDev
  })
  exec(`npm run polyfill`, { env })
  exec(`npm run vendor`, { env })

  files = readJSON(path.resolve(BUILD, 'version.json'))
  return files
}

exports.helper = {
  output,
  loaders,
  plugins,
  resolve,
  resolveLoader,
  devServer
}

exports.print = print
exports.join = join
exports.copyFileToDist = copyFileToDist
