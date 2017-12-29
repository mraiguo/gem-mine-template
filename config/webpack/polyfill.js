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
  module: {},
  plugins: [
    helper.plugins.uglify(),
    function() {
      this.plugin('done', function() {
        exec(`cp ${PUBLIC}/polyfill-promise.js ${BUILD}`);
      });
    }
  ]
};

module.exports = config;
