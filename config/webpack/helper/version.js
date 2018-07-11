const path = require('path')
const chalk = require('chalk')
const {
  printBox,
  checkCliVersion: _checkCliVersion,
  checkTemplateVersion: _checkTemplateVersion,
  checkUIVersion: _checkUIVersion,
  checkClassicVersion: _checkClassicVersion
} = require('gem-mine-helper')
const { ROOT, GEM_MINE_DOC, GEM_MINE_DOC_VERSION } = require('../constant')
const { getConfig } = require('./util')

function checkCliVersion() {
  let message
  _checkCliVersion(function ({ localVersion, remoteVersion }) {
    if (localVersion) {
      if (remoteVersion && localVersion !== remoteVersion) {
        message = `gem-mine 发现新版本 ${chalk.gray(localVersion)} → ${chalk.yellow(
          remoteVersion
        )}，请执行 ${chalk.yellow('npm i -g gem-mine')} 进行更新
版本履历：${chalk.green(GEM_MINE_DOC_VERSION)}`
      }
    } else {
      message = `gem-mine 未安装，请执行 ${chalk.yellow('npm i -g gem-mine')} 进行安装
帮助文档：${chalk.green(GEM_MINE_DOC)}`
    }
  })
  return message
}

function checkTemplateVersion(context) {
  let message
  _checkTemplateVersion(context, function ({ localVersion, remoteVersion }) {
    if (remoteVersion && localVersion !== remoteVersion) {
      message = `工程代码骨架 发现新版本 ${chalk.gray(localVersion)} → ${chalk.yellow(remoteVersion)}`
    }
  })
  return message
}

function checkUIVersion(context) {
  let message
  const { ui } = context
  if (ui) {
    _checkUIVersion(context, function ({ localVersion, remoteVersion }) {
      if (remoteVersion && localVersion !== remoteVersion) {
        message = `UI库(${ui}) 发现新版本 ${chalk.gray(localVersion)} → ${chalk.yellow(remoteVersion)}`
      }
    })
  }
  return message
}

function checkClassicVersion(context) {
  let message
  const { classic_git: git } = context
  if (git) {
    _checkClassicVersion(context, function ({ localVersion, remoteVersion }) {
      if (remoteVersion && localVersion !== remoteVersion) {
        message = `使用的经典代码发现新版本 ${chalk.gray(localVersion)} → ${chalk.yellow(remoteVersion)}`
      }
    })
  }
  return message
}

module.exports = function () {
  const context = getConfig(path.join(ROOT, '.gem-mine'))
  const prefix = '🚀  '
  let message = ''
  const cliMessage = checkCliVersion()
  if (cliMessage) {
    message += `${prefix}${cliMessage}`
  }

  const templateInfo = checkTemplateVersion(context)
  const uiInfo = checkUIVersion(context)
  const classicInfo = checkClassicVersion(context)
  if (templateInfo || uiInfo || classicInfo) {
    if (cliMessage) {
      message += '\n\n\n'
    }
    if (templateInfo) {
      message += `${prefix}${templateInfo}\n`
    }
    if (uiInfo) {
      message += `${prefix}${uiInfo}\n`
    }
    if (classicInfo) {
      message += `${prefix}${classicInfo}\n`
    }
    message += `请执行 ${chalk.yellow('gem-mine update')} 进行更新`
  }

  printBox({ message })
}
