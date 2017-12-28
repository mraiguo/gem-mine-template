const path = require('path');
const fs = require('fs');
const { helper, BUILD, setFileVersion } = require('./helper');
const cfg = require('../webpack');

const config = {
  entry: {
    vendor: ['react', 'react-dom', 'prop-types', 'cat-eye'].concat(cfg.vendor)
  },
  output: helper.output.lib(),
  resolve: helper.resolve(),
  resolveLoader: helper.resolveLoader(),
  module: {
    loaders: [helper.loaders.babel()]
  },
  plugins: [
    helper.plugins.define('production'),
    helper.plugins.dll(),
    helper.plugins.uglify(),
    function() {
      this.plugin('done', function() {
        const dist = path.resolve(BUILD, 'vendor.js');
        setFileVersion(dist);
      });
    }
  ]
};

module.exports = config;
