const path = require('path')
const { SRC, BUILD, CDN } = require('./constant')
const { helper, preBuild, join } = require('./helper')
const shouldAnalyzer = !!process.env.npm_config_analyzer
const custom = require('../webpack')

const files = preBuild()

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
      helper.loaders.css(false, custom.excludeStyleModule),
      helper.loaders.less(false, custom.excludeStyleModule),
      helper.loaders.sass(false, custom.excludeStyleModule),
      helper.loaders.json(),
      helper.loaders.source(),
      custom.loaders
    ),
    postLoaders: join(helper.loaders.exports(), helper.loaders.es3ify())
  },
  plugins: join(
    helper.plugins.define('production', {
      DEBUG: false
    }),
    helper.plugins.md5hash(),
    helper.plugins.dllReference(),
    helper.plugins.extractCss(),
    helper.plugins.splitCss(),
    helper.plugins.uglify(true),
    helper.plugins.html({
      minify: true,
      files
    }),
    custom.plugins,
    helper.plugins.done(function () {
      if (CDN) {
        console.log('\n 开始进行 CDN 自动化处理')
        try {
          const upload = require(custom.cdn.package)
          const params = Object.assign(
            {
              dist: BUILD,
              complete() {
                console.log('CDN 处理完毕')
              }
            },
            custom.cdn.params
          )
          upload(params)
        } catch (e) {
          console.log(e)
        }
      }
    }, true)
  ),
  stats: {
    children: false,
    colors: true
  }
}

if (shouldAnalyzer) {
  config.plugins.push(helper.plugins.analyzer())
}

module.exports = config
