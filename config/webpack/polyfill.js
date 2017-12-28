const path = require('path');
const fs = require('fs');
const { helper, concat, exec, BUILD, PUBLIC, setFileVersion } = require('./helper');

const config = {
  entry: {
    polyfill: ['babel-polyfill']
  },
  output: helper.output.lib(),
  resolve: {
    extensions: ['', '.js']
  },
  module: {
    postLoaders: [helper.loaders.es3ify()]
  },
  plugins: [
    helper.plugins.uglify(),
    function() {
      this.plugin('done', function() {
        const dist = path.resolve(BUILD, 'polyfill.js');
        concat([path.resolve(PUBLIC, 'polyfill.js'), dist], dist);
        exec(`cp ${PUBLIC}/polyfill-promise.js ${BUILD}`);
        setFileVersion(dist);
      });
    }
  ]
};

module.exports = config;
