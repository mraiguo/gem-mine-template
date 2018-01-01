const path = require('path');
const { helper, ROOT, PUBLIC, SRC, join } = require('./helper');

const isHot = !!process.env.npm_config_hot;
const shouldAnalyzer = !!process.env.npm_config_analyzer;

const config = {
  entry: {
    polyfill: [path.resolve(PUBLIC, 'polyfill.js'), 'babel-polyfill'],
    main: path.resolve(SRC, 'index.js')
  },
  output: helper.output.hash(),
  resolve: helper.resolve(),
  resolveLoader: helper.resolveLoader(),
  devtool: 'eval-source-map',
  module: {
    loaders: join(
      helper.loaders.babel(),
      helper.loaders.css(),
      helper.loaders.less(),
      helper.loaders.sass(),
      helper.loaders.source()
    ),
    postLoaders: join(helper.loaders.exports(), helper.loaders.es3ify())
  },
  plugins: [
    helper.plugins.define('dev', {
      DEBUG: true
    }),
    helper.plugins.ignore(/vertx/),
    helper.plugins.extractCss(),
    helper.plugins.splitCss(),
    helper.plugins.html()
  ],
  devServer: helper.devServer()
};

if (isHot) {
  config.plugins.push(helper.plugins.hot());
}
if (shouldAnalyzer) {
  config.plugins.push(helper.plugins.analyzer());
}

const devServer = helper.devServer();
config.plugins.push(helper.plugins.browser(`http://${devServer.host}:${devServer.port}`));
config.devServer = devServer;

module.exports = config;
