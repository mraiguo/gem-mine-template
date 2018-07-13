const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const { join } = require('./util')
const { NODE_MODULES, STYLE, CONFIG } = require('../constant')

function loadStyle(hot, type, exclude) {
  const excludes = join(NODE_MODULES, STYLE, exclude)
  const loaders = ['style-loader', 'css-loader']
  const CSS_MODULE = 'modules&importLoaders=1&localIdentName=[name]__[local]-[hash:base64:5]'
  let reg
  loaders.push(
    `postcss-loader?${JSON.stringify({
      sourceMap: true,
      config: {
        path: path.resolve(CONFIG, 'webpack/postcss.config.js')
      }
    })}`
  )
  if (type === 'css') {
    reg = /\.css$/
  } else {
    if (type === 'less') {
      loaders.push('less-loader')
      reg = /\.less$/
    } else if (type === 'sass') {
      loaders.push('sass-loader?outputStyle=expanded')
      reg = /\.scss$/
    }
  }

  let last = ''
  if (type !== 'css') {
    last = `!${loaders[3]}`
  }

  const result = [
    {
      test: reg,
      exclude: excludes,
      loader: hot
        ? `${loaders[0]}!${loaders[1]}?${CSS_MODULE}!${loaders[2]}${last}`
        : ExtractTextPlugin.extract(loaders[0], `${loaders[1]}?${CSS_MODULE}!${loaders[2]}${last}`)
    },
    {
      test: reg,
      include: excludes,
      loader: hot
        ? `${loaders[0]}!${loaders[1]}!${loaders[2]}${last}`
        : ExtractTextPlugin.extract(loaders[0], `${loaders[1]}!${loaders[2]}${last}`)
    }
  ]

  return result
}

module.exports = {
  babel: function (hot) {
    const obj = {
      test: /\.jsx?$/,
      exclude: NODE_MODULES
    }
    if (hot) {
      obj.loader = 'react-hot-loader!babel-loader?cacheDirectory=true'
    } else {
      obj.loader = 'babel-loader'
    }
    return obj
  },
  css: function (hot, exclude) {
    return loadStyle(hot, 'css', exclude)
  },
  less: function (hot, exclude) {
    return loadStyle(hot, 'less', exclude)
  },
  sass: function (hot, exclude) {
    return loadStyle(hot, 'sass', exclude)
  },
  source: function () {
    return [
      {
        test: /\.(png|jpg|gif|woff|woff2)$/,
        loader: 'url-loader?name=[name]-[hash].[ext]&limit=10240'
      },
      {
        test: /\.(mp4|ogg|svg)$/,
        loader: 'file-loader'
      }
    ]
  },
  es3ify: function () {
    return {
      test: /\.jsx?$/,
      loader: 'es3ify-loader'
    }
  },
  exports: function () {
    return {
      test: /\.jsx?$/,
      exclude: NODE_MODULES,
      loader: 'export-from-ie8/loader'
    }
  },
  json: function () {
    return {
      test: /\.json$/,
      loader: 'json-loader'
    }
  }
}
