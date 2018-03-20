const path = require('path')
const { SRC } = require('./constant')
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
    helper.plugins.dllReference(),
    helper.plugins.extractCss(),
    helper.plugins.splitCss(),
    helper.plugins.uglify(true),
    helper.plugins.html(
      Object.assign(
        {
          minify: true,
          files
        }
      )
    ),
    custom.plugins,
    helper.plugins.done()
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
