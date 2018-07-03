const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const { join } = require('./util')
const { getPublicPath } = require('./source-path')
const config = require('../../webpack')
const { NODE_MODULES, STYLE, CONFIG } = require('../constant')

const publicPath = getPublicPath(config)

function loadStyle(hot, type, exclude) {
  const excludes = join(NODE_MODULES, STYLE, exclude)
  const styleLoader = {
    loader: 'style-loader'
  }

  const cssLoader = {
    loader: 'css-loader'
  }

  const cssLoaderWithModule = {
    loader: 'css-loader',
    options: {
      modules: true,
      importLoaders: 1,
      localIdentName: '[name]__[local]-[hash:base64:5]'
    }
  }

  let thirdLoader

  let reg
  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: true,
      config: {
        path: path.resolve(CONFIG, 'webpack')
      }
    }
  }
  if (type === 'css') {
    reg = /\.css$/
  } else {
    if (type === 'less') {
      thirdLoader = {
        loader: 'less-loader',
        options: {
          sourceMap: true
        }
      }
      reg = /\.less$/
    } else if (type === 'sass') {
      thirdLoader = {
        loader: 'sass-loader',
        options: {
          outputStyle: 'expand',
          sourceMap: true
        }
      }
      reg = /\.scss$/
    }
  }

  const loaders = {
    exclude: {
      hot: [styleLoader, cssLoaderWithModule, postcssLoader],
      extract: [cssLoaderWithModule, postcssLoader]
    },
    include: {
      hot: [styleLoader, cssLoader, postcssLoader],
      extract: [cssLoader, postcssLoader]
    }
  }
  if (thirdLoader) {
    loaders.exclude.hot.push(thirdLoader)
    loaders.exclude.extract.push(thirdLoader)
    loaders.include.hot.push(thirdLoader)
    loaders.include.extract.push(thirdLoader)
  }

  const result = [
    {
      test: reg,
      exclude: excludes,
      use: hot
        ? loaders.exclude.hot
        : ExtractTextPlugin.extract({
          fallback: styleLoader,
          publicPath,
          use: loaders.exclude.extract
        })
    },
    {
      test: reg,
      include: excludes,
      use: hot
        ? loaders.include.hot
        : ExtractTextPlugin.extract({
          fallback: styleLoader,
          publicPath,
          use: loaders.include.extract
        })
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
    let loaders
    if (hot) {
      loaders = ['cache-loader', 'react-hot-loader/webpack', 'babel-loader?cacheDirectory=true']
    } else {
      loaders = ['babel-loader']
    }
    obj.use = loaders
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
  }
}
