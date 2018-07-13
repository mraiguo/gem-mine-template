const path = require('path')
const fs = require('fs-extra')
const crypto = require('crypto')
const rd = require('rd')
const { log } = require('gem-mine-helper')

exports.concat = function (sources, dist) {
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

const getFileMD5 = function (dist) {
  const str = fs.readFileSync(dist, 'utf-8')
  const md5um = crypto.createHash('md5')
  md5um.update(str)
  const md5 = md5um.digest('hex')
  return md5
}

exports.copyFileToDist = function (file, distDir, removeSource, genHash = true) {
  const ext = path.extname(file)
  const fileName = path.basename(file, ext)
  const versionFilePath = path.resolve(distDir, 'version.json')
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

exports.clean = function ({ dist, excludes }) {
  if (dist) {
    if (excludes) {
      const files = rd.readSync(dist)
      files.shift()
      files.forEach(function (file) {
        if (file !== dist) {
          const exists = excludes.some(function (exclude) {
            return path.join(dist, exclude) === file
          })
          if (!exists) {
            fs.removeSync(file)
          }
        }
      })

      log.info(`clean dist: ${dist}, exclude: [${excludes}]`)
    } else {
      if (fs.existsSync(dist)) {
        log.info(`clean dist: ${dist}`)
        fs.removeSync(dist)
      }
    }
  }
}
