const path = require('path')
const detect = require('detect-port')
const chalk = require('chalk')
const { helper, PUBLIC, SRC, join } = require('./helper')

const isHot = process.env.npm_config_hot !== ''
const shouldAnalyzer = !!process.env.npm_config_analyzer

const custom = require('../webpack')

const configPromise = new Promise(function (resolve, reject) {
  const config = {
    entry: {
      polyfill: [path.resolve(PUBLIC, 'polyfill-ie8.js'), 'babel-polyfill'],
      main: [path.resolve(SRC, 'index.js')]
    },
    output: helper.output.hash(),
    resolve: helper.resolve(),
    resolveLoader: helper.resolveLoader(),
    devtool: 'source-map',
    module: {
      loaders: join(
        helper.loaders.babel(isHot),
        helper.loaders.css(isHot),
        helper.loaders.less(isHot),
        helper.loaders.sass(isHot),
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
      helper.plugins.extractCss(),
      helper.plugins.splitCss(),
      helper.plugins.html(),

      custom.plugins,
      helper.plugins.done()
    ),
    postcss: helper.postcss,
    stats: { chunks: false, children: false }
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
        console.log(chalk.cyanBright(`warning: port ${port} has been used, will use the ${p} instead.\n`))
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
