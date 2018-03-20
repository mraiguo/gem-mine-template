const path = require('path')
const fs = require('fs-extra')
const os = require('os')
const crypto = require('crypto')
const chalk = require('chalk')
const execSync = require('child_process').execSync

const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const OpenBrowserPlugin = require('open-browser-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const DonePlugin = require('./plugins/done')
const constant = require('./constant')

const config = require('../webpack')
let proxy
try {
  proxy = require('../proxy')
} catch (e) {
  proxy = {}
}

const { ROOT, NODE_MODULES, SRC, BUILD, PUBLIC, CONFIG, STYLE } = constant
const { MODE } = process.env

let SOURCE_IN_HTML_PUBLIC_PATH
const isLocal = MODE === 'dev'
if (isLocal) {
  SOURCE_IN_HTML_PUBLIC_PATH = ''
} else {
  SOURCE_IN_HTML_PUBLIC_PATH = config.publicPath
}

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

function copyFileToDist(file, distDir, removeSource, genHash = true) {
  const ext = path.extname(file)
  const fileName = path.basename(file, ext)
  const versionFilePath = path.resolve(BUILD, 'version.json')
  const hash = getFileMD5(file)

  let shouldUpdate = false
  let shouldCopy = true
  let data
  const result = { hash, ext }
  if (fs.existsSync(versionFilePath)) {
    data = fs.readJSONSync(versionFilePath)
    let res = data[fileName]
    if (res) {
      if (res.hash !== hash) {
        res = result
        shouldUpdate = true
      } else {
        shouldCopy = false
      }
    } else {
      res = result
      shouldCopy = false
      shouldUpdate = true
    }
    data[fileName] = res
  } else {
    data = {
      [fileName]: result
    }
    shouldCopy = true
    shouldUpdate = true
  }

  let dist

  if (genHash) {
    dist = path.resolve(distDir, `${fileName}-${hash}${ext}`)
  } else {
    dist = path.resolve(distDir, `${fileName}${ext}`)
  }
  if (!fs.existsSync(dist)) {
    shouldCopy = true
  } else if (dist === file) {
    shouldCopy = false
    removeSource = false
  }

  if (shouldCopy) {
    fs.copySync(file, dist)
  }
  if (shouldUpdate) {
    fs.writeJSONSync(versionFilePath, data)
  }
  if (removeSource) {
    fs.removeSync(file)
  }
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

function clean(params = {}) {
  let p
  if (params.path) {
    p = params.path
    delete params.path
  } else {
    p = BUILD
  }
  if (fs.existsSync(p)) {
    console.log(chalk.cyan(`> clean dist: ${p}`))
    fs.removeSync(p)
  }
}

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
          publicPath: config.publicPath,
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
          publicPath: config.publicPath,
          use: loaders.include.extract
        })
    }
  ]
  return result
}

function getIP() {
  let host = process.env.npm_config_host
  if (!host) {
    if (process.platform === 'win32') {
      const ns = os.networkInterfaces()
      const keys = Object.keys(ns)
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        const arr = ns[key]
        for (let j = 0; j < arr.length; j++) {
          if (arr[j].family === 'IPv4' && arr[j].internal === false) {
            host = arr[j].address
            break
          }
        }
        if (host) {
          break
        }
      }
      if (!host) {
        host = 'localhost'
      }
    } else {
      host = '0.0.0.0'
    }
  }
  return host
}

function preBuild() {
  clean()
  let files

  console.log(chalk.cyan('> build polyfill && vendor'))
  exec('npm run polyfill && npm run vendor')

  let versionFile = path.resolve(BUILD, 'version.json')

  files = JSON.parse(fs.readFileSync(versionFile).toString())
  return files
}

const helper = {
  output: {
    // for dev/production
    hash: function (params = {}) {
      return Object.assign(
        {
          path: BUILD,
          filename: `[name]${config.staticHash ? '-[hash]' : ''}.js`,
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
  },

  resolve: function () {
    const params = config.resolve || {}
    const obj = {
      modules: [NODE_MODULES],
      extensions: ['.js', '.jsx', '.css', '.less', '.scss'],
      alias: {
        config: CONFIG,
        components: path.resolve(SRC, 'components'),
        styles: path.resolve(SRC, 'styles'),
        global: path.resolve(SRC, 'global'),
        'fish-mobile': '@sdp.nd/fish-mobile'
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
        modules: [NODE_MODULES]
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
    scopeHosting: function () {
      return new webpack.optimize.ModuleConcatenationPlugin()
    },
    hot: function () {
      return new webpack.HotModuleReplacementPlugin()
    },
    html: function (params = {}) {
      const obj = Object.assign(
        {
          template: path.resolve(PUBLIC, 'index.html'),
          filename: 'index.html',
          inject: false,
          showErrors: true,
          title: config.title,
          staticHash: config.staticHash,
          prefix: config.publicPath
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
          properties: false
        },
        output: {
          quote_keys: true,
          comments: false
        },
        sourceMap
      })
    },
    browser: function (url) {
      return new OpenBrowserPlugin({ url })
    },
    extractCss: function () {
      return new ExtractTextPlugin({
        filename: '[name].[contenthash].css',
        allChunks: true
      })
    },
    analyzer: function () {
      return new BundleAnalyzerPlugin()
    },
    done: function (callback) {
      return new DonePlugin(function () {
        if (config.additional) {
          config.additional.forEach(function (name) {
            fs.copySync(`${PUBLIC}/${name}`, `${BUILD}/${name}`)
          })
        }
        const fav = 'favicon.ico'
        if (fs.existsSync(path.resolve(PUBLIC, fav))) {
          fs.copySync(`${PUBLIC}/${fav}`, `${BUILD}/${fav}`)
        }
        if (config.done) {
          config.done(exports, config)
        }
        if (callback) {
          callback(exports, config)
        }
      })
    }
  },
  devServer: function (hot, port, params = {}) {
    let obj = {
      contentBase: BUILD,
      host: getIP(),
      port: port,
      overlay: true,
      stats: {
        chunks: false,
        children: false,
        chunkModules: false,
        chunkOrigins: false,
        colors: true,
        errors: true,
        warnings: false
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
  }
}

exports.helper = helper
exports.exec = exec
exports.concat = concat
exports.getFileMD5 = getFileMD5
exports.copyFileToDist = copyFileToDist
exports.join = join
exports.preBuild = preBuild
