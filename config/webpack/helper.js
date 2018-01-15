const path = require('path')
const fs = require('fs-extra')
const crypto = require('crypto')
const execSync = require('child_process').execSync

const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const OpenBrowserPlugin = require('open-browser-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CSSSplitWebpackPlugin = require('css-split-webpack-plugin').default
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const DonePlugin = require('./plugins/done')

const config = require('../webpack')
let proxy
try {
  proxy = require('../proxy')
} catch (e) {
  proxy = {}
}

const ROOT = path.resolve(__dirname, '../../')
const NM = 'node_modules'
const NODE_MODULES = path.resolve(ROOT, NM)
const SRC = path.resolve(ROOT, 'src')
const BUILD = config.buildPath || path.resolve(ROOT, 'build')
const PUBLIC = path.resolve(ROOT, 'public')
const CONFIG = path.resolve(ROOT, 'config')
const STYLE = path.resolve(SRC, 'styles')
const BUNDLE = path.resolve(BUILD, 'bundle')

const { MODE } = process.env

const DEFAULT_PUBLIC_PATH = './'
// css 和 图片默认打包在同一个目录
const SOURCE_IN_CSS_PUBLIC_PATH = {
  publicPath: config.publicPath || DEFAULT_PUBLIC_PATH
}
// jsx 编译后的 js 是被 html 引入，html 在 bundle 的上一级
let SOURCE_IN_HTML_PUBLIC_PATH
const isLocal = MODE === 'dev'
if (isLocal) {
  SOURCE_IN_HTML_PUBLIC_PATH = ''
} else {
  SOURCE_IN_HTML_PUBLIC_PATH = config.publicPath || DEFAULT_PUBLIC_PATH + 'bundle/'
}

const port = process.env.npm_config_port || config.port || 9000

function exec(cmd) {
  execSync(cmd, {}).toString()
}

function concat(sources, dist) {
  const dir = path.dirname(dist)
  fs.ensureDirSync(dir)

  const firstFile = sources.shift()
  let content = fs.readFileSync(firstFile).toString()
  fs.writeFileSync(dist, content.replace(/<\/script>/g, '<\\x3cscript>'))
  sources.forEach(function (src) {
    content = fs.readFileSync(src).toString()
    fs.appendFileSync(dist, content.replace(/<\/script>/g, '<\\x3cscript>'))
  })
}

function getFileMD5(path) {
  const str = fs.readFileSync(path, 'utf-8')
  const md5um = crypto.createHash('md5')
  md5um.update(str)
  const md5 = md5um.digest('hex')
  return md5
}

function setFileVersion(dist) {
  const versionFilePath = path.resolve(BUILD, 'version.json')
  let data
  if (fs.existsSync(versionFilePath)) {
    data = require(versionFilePath)
  } else {
    data = {}
  }
  const key = path.basename(dist, path.extname(dist))
  data[key] = getFileMD5(dist)
  fs.writeFileSync(versionFilePath, JSON.stringify(data, null, 2))
}

function join() {
  let result = []
  for (let i = 0; i < arguments.length; i++) {
    const value = arguments[i]
    if (value) {
      if (Array.isArray(value)) {
        result = result.concat(value)
      } else {
        result.push(value)
      }
    }
  }
  return result
}

function loadStyle(hot, type, exclude) {
  const excludes = join(NODE_MODULES, STYLE, exclude)
  const loaders = ['style-loader', 'css-loader']
  const CSS_MODULE = 'modules&importLoaders=1&localIdentName=[name]__[local]-[hash:base64:5]'
  let reg
  if (type === 'css') {
    loaders.push('postcss-loader')
    reg = /\.css$/
  } else if (type === 'less') {
    loaders.push('less-loader')
    reg = /\.less$/
  } else if (type === 'sass') {
    loaders.push('sass-loader?outputStyle=expanded')
    reg = /\.scss$/
  }

  let last = ''
  if (type !== 'css') {
    last = `!${loaders[2]}`
  }

  const result = [
    {
      test: reg,
      exclude: excludes,
      loader: hot
        ? `${loaders[0]}!${loaders[1]}?${CSS_MODULE}!${loaders[2]}`
        : ExtractTextPlugin.extract(loaders[0], `${loaders[1]}?${CSS_MODULE}!${loaders[2]}`, SOURCE_IN_CSS_PUBLIC_PATH)
    },
    {
      test: reg,
      include: excludes,
      loader: hot
        ? `${loaders[0]}!${loaders[1]}${last}`
        : ExtractTextPlugin.extract(loaders[0], `${loaders[1]}${last}`, SOURCE_IN_CSS_PUBLIC_PATH)
    }
  ]

  return result
}

const helper = {
  output: {
    // for dev/production
    hash: function (params = {}) {
      return Object.assign(
        {
          path: BUNDLE,
          filename: '[name]-[hash].js',
          publicPath: SOURCE_IN_HTML_PUBLIC_PATH
        },
        params
      )
    },
    // for vendor/polyfill
    lib: function (params = {}) {
      return Object.assign(
        {
          path: BUILD,
          filename: '[name].js',
          library: '[name]'
        },
        params
      )
    }
  },

  loaders: {
    babel: function (hot) {
      const obj = {
        test: /\.jsx?$/,
        exclude: NODE_MODULES
      }
      if (hot) {
        obj.loader = 'react-hot-loader!babel-loader'
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
  },

  resolve: function () {
    const params = config.resolve || {}
    const obj = {
      fallback: NODE_MODULES,
      extensions: ['', '.js', '.jsx', '.css', '.less', '.scss'],
      alias: {
        config: CONFIG,
        components: path.resolve(SRC, 'components'),
        styles: path.resolve(SRC, 'styles'),
        global: path.resolve(SRC, 'global'),
        fish: '@sdp.nd/fish'
      }
    }
    if (params.extensions) {
      obj.extensions = obj.extensions.concat(params.extensions)
    }
    if (params.alias) {
      obj.alias = Object.assign(obj.alias, params.alias)
    }
    Object.keys(params).forEach(key => {
      if (!obj[key]) {
        obj[key] = params[key]
      }
    })
    return obj
  },

  resolveLoader: function (params = {}) {
    return Object.assign(
      {
        root: NODE_MODULES
      },
      params
    )
  },

  plugins: {
    define: function (env, params = {}) {
      let obj = {
        'process.env': {
          NODE_ENV: JSON.stringify(env)
        },
        ENV: JSON.stringify(process.env.npm_config_env) // 命令运行 --env=xxx
      }
      return new webpack.DefinePlugin(Object.assign(obj, params))
    },
    ignore: function (rule) {
      return new webpack.IgnorePlugin(rule)
    },
    hot: function () {
      return new webpack.HotModuleReplacementPlugin()
    },
    splitCss: function () {
      return new CSSSplitWebpackPlugin({ size: 4000 })
    },
    html: function (params = {}) {
      const obj = Object.assign(
        {
          template: path.resolve(PUBLIC, 'index.html'),
          filename: isLocal ? 'index.html' : '../index.html',
          inject: false,
          showErrors: true,
          title: config.title
        },
        params
      )
      if (params.minify === true) {
        obj.minify = {
          removeComments: true,
          collapseWhitespace: true
        }
      }
      return new HtmlWebpackPlugin(obj)
    },
    dll: function (params = {}) {
      return new webpack.DllPlugin(
        Object.assign(
          {
            path: path.resolve(ROOT, 'manifest.json'),
            name: '[name]',
            context: ROOT
          },
          params
        )
      )
    },
    dllReference: function (params = {}) {
      return new webpack.DllReferencePlugin(
        Object.assign(
          {
            context: ROOT,
            manifest: require(path.resolve(ROOT, 'manifest.json'))
          },
          params
        )
      )
    },
    uglify: function (sourceMap = false) {
      return new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
          properties: false,
          screw_ie8: false
        },
        mangle: {
          screw_ie8: false
        },
        output: {
          screw_ie8: false,
          quote_keys: true,
          comments: false
        },
        sourceMap
      })
    },
    clean: function (params = {}) {
      const p = params.path || [path.resolve(BUILD, 'bundle')]
      delete params.path

      return new CleanWebpackPlugin(
        p,
        Object.assign(
          {
            root: ROOT,
            exclude: [],
            verbose: true,
            dry: false
          },
          params
        )
      )
    },
    dedupe: function () {
      return new webpack.optimize.DedupePlugin()
    },
    occurence: function () {
      return new webpack.optimize.OccurenceOrderPlugin()
    },
    browser: function (url) {
      return new OpenBrowserPlugin({ url })
    },
    extractCss: function () {
      return new ExtractTextPlugin('[name].[contenthash].css', {
        allChunks: true
      })
    },
    analyzer: function () {
      return new BundleAnalyzerPlugin()
    },
    done: function (callback) {
      return new DonePlugin(function () {
        if (callback) {
          callback(exports, config)
        }
        if (config.additional) {
          config.additional.forEach(function (name) {
            fs.copySync(`${PUBLIC}/${name}`, `${BUILD}/${name}`)
          })
        }
        if (config.done) {
          config.done(exports, config)
        }
      })
    }
  },
  devServer: function (hot, params = {}) {
    let obj = {
      contentBase: BUILD,
      host: process.platform === 'win32' ? '127.0.0.1' : '0.0.0.0',
      port: port,
      stats: {
        chunks: false,
        children: false
      },
      proxy: {}
    }
    if (hot) {
      obj.inline = true
      obj.hot = true
    }

    Object.keys(proxy).forEach(function (key) {
      const item = proxy[key]
      const wds = item.wds
      if (wds) {
        const prefix = `/${key}_wds`
        obj.proxy[prefix] = {
          target: wds.url,
          changeOrigin: true,
          secure: false,
          pathRewrite: { [`^${prefix}`]: '' }
        }
      }
    })
    return Object.assign(obj, params)
  },
  postcss: function () {
    return [
      require('postcss-import')({ addDependencyTo: webpack }),
      require('postcss-cssnext')({ autoprefixer: { browsers: BROWSER } })
    ]
  }
}

exports.ROOT = ROOT
exports.NODE_MODULES = NODE_MODULES
exports.SRC = SRC
exports.BUILD = BUILD
exports.PUBLIC = PUBLIC
exports.helper = helper
exports.exec = exec
exports.concat = concat
exports.getFileMD5 = getFileMD5
exports.setFileVersion = setFileVersion
exports.join = join
