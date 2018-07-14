const path = require('path')
const detect = require('detect-port')
const { log } = require('gem-mine-helper')
const { SRC } = require('./constant')
const { helper, join, preBuild } = require('./helper')
const custom = require('../webpack')

const isHot = process.env.npm_config_hot !== ''
const shouldAnalyzer = !!process.env.npm_config_analyzer

const files = preBuild()

const configPromise = new Promise(function (resolve, reject) {
  const config = {
    entry: {
      main: [path.resolve(SRC, 'index.js')]
    },
    output: helper.output.hash(),
    resolve: helper.resolve(),
    resolveLoader: helper.resolveLoader(),
    devtool: 'cheap-module-eval-source-map',
    cache: true,
    module: {
      loaders: join(
        helper.loaders.babel(isHot),
        helper.loaders.css(isHot, custom.excludeStyleModule),
        helper.loaders.less(isHot, custom.excludeStyleModule),
        helper.loaders.sass(isHot, custom.excludeStyleModule),
        helper.loaders.json(),
        helper.loaders.source(),
        custom.loaders
      ),
      postLoaders: join(helper.loaders.exports(), helper.loaders.es3ify())
    },
    plugins: join(
      helper.plugins.define('dev', {
        DEBUG: true
      }),
      helper.plugins.ignore(/vertx/),
      helper.plugins.dllReference(),
      helper.plugins.extractCss(),
      helper.plugins.splitCss(),
      helper.plugins.html({ files }, false),

      custom.plugins,
      helper.plugins.done(null, true, true)
    ),
    stats: {
      children: false,
      colors: true
    }
  }

  if (isHot) {
    config.plugins.push(helper.plugins.hot())
  }
  if (shouldAnalyzer) {
    config.plugins.push(helper.plugins.analyzer())
  }

  let port = process.env.npm_config_port || config.port || 9000
  detect(port)
    .then(function (p) {
      if (port !== p) {
        log.warning(`warning: port ${port} has been used, will use the ${p} instead.\n`)
        port = p
      }
      const devServer = helper.devServer(isHot, port)
      config.plugins.push(helper.plugins.browser(`http://${devServer.host}:${devServer.port}`))
      config.devServer = devServer
      resolve(config)
    })
    .catch(function (err) {
      console.log(err)
      process.exit(0)
    })
})

module.exports = configPromise
