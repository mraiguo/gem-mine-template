const path = require('path')
const fs = require('fs')
const { SRC, BUILD, helper, exec, join } = require('./helper')
let version
const versionFile = path.resolve(BUILD, 'version.json')
const buildVendor = !!process.env.npm_config_vendor
const buildPolyfill = !!process.env.npm_config_polyfill
const shouldAnalyzer = !!process.env.npm_config_analyzer
const custom = require('../webpack')

if (buildVendor || buildPolyfill) {
  if (buildVendor && buildPolyfill) {
    console.log('> build polyfill && vendor')
    exec('npm run polyfill && npm run vendor')
  } else {
    if (buildPolyfill) {
      console.log('> build polyfill')
      exec('npm run polyfill')
    } else {
      console.log('> build vendor')
      exec('npm run vendor')
    }
  }
  version = JSON.parse(fs.readFileSync(versionFile).toString())
} else {
  try {
    version = require(versionFile)
  } catch (e) {
    console.warn('> polyfill and vendor not generate, will auto run npm run polyfill/vendor')
    exec('npm run polyfill && npm run vendor')
    version = JSON.parse(fs.readFileSync(versionFile).toString())
  }
}

const config = {
  entry: {
    main: path.resolve(SRC, 'index.js')
  },
  output: helper.output.hash(),
  devtool: 'source-map',
  resolve: helper.resolve(),
  module: {
    loaders: join(
      helper.loaders.babel(),
      helper.loaders.css(),
      helper.loaders.less(),
      helper.loaders.sass(),
      helper.loaders.json(),
      helper.loaders.source(),
      custom.loaders
    ),
    postLoaders: join(helper.loaders.exports(), helper.loaders.es3ify())
  },
  plugins: join(
    helper.plugins.dedupe(),
    helper.plugins.occurence(),
    helper.plugins.define('production', {
      DEBUG: false
    }),
    helper.plugins.clean(),
    helper.plugins.dllReference(),
    helper.plugins.extractCss(),
    helper.plugins.splitCss(),
    helper.plugins.uglify(true),
    helper.plugins.html(
      Object.assign(
        {
          minify: true
        },
        version
      )
    ),
    custom.plugins,
    helper.plugins.done()
  ),
  postcss: helper.postcss,
  stats: { chunks: false, children: false }
}

if (shouldAnalyzer) {
  config.plugins.push(helper.plugins.analyzer())
}

module.exports = config
