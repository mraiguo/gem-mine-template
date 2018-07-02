const path = require('path')
const chalk = require('chalk')
const { exec } = require('./cmd')
const print = require('./print')
const { ROOT, GEM_MINE_DOC, GEM_MINE_DOC_VERSION, SDP_PREFIX, ND_NPM, UI_DOC } = require('../constant')
const { getConfig } = require('./util')
const got = require('got')

function checkCliVersion() {
  let localVersion
  try {
    localVersion = exec('gem-mine --version', false)
    const remoteVersion = exec(`npm show gem-mine version`, false)
    if (localVersion !== remoteVersion) {
      return `gem-mine 发现新版本 ${chalk.gray(localVersion)} → ${chalk.yellow(remoteVersion)}，请执行 ${chalk.yellow(
        'npm i -g gem-mine'
      )} 进行更新
版本履历：${chalk.green(GEM_MINE_DOC_VERSION)}`
    }
  } catch (e) {
    return `gem-mine 未安装，请执行 ${chalk.yellow('npm i -g gem-mine')} 进行安装
帮助文档：${chalk.green(GEM_MINE_DOC)}`
  }
}

function checkTemplateVersion(gemMine) {
  const localVersion = gemMine.templateVersion
  const remoteVersion = exec(`npm show gem-mine-template version`, false)
  if (localVersion !== remoteVersion) {
    return `项目脚手架发现新版本 ${chalk.gray(localVersion)} → ${chalk.yellow(remoteVersion)}，版本履历：${chalk.green(
      GEM_MINE_DOC_VERSION
    )}`
  }
}

function checkUIVersion(gemMine) {
  const ui = gemMine.ui
  if (ui) {
    const localVersion = gemMine.uiVersion
    let remoteVersion
    if (ui.indexOf(SDP_PREFIX) === 0) {
      remoteVersion = exec(`npm show ${ui} version --registry=${ND_NPM}`, false)
    } else {
      remoteVersion = exec(`npm show ${ui} version`, false)
    }
    const changeLog = UI_DOC[ui] ? `，版本履历：${chalk.green(UI_DOC[ui])}` : ''
    if (localVersion !== remoteVersion) {
      return `ui库(${ui})发现新版本 ${chalk.gray(localVersion)} → ${chalk.yellow(remoteVersion)} ${changeLog}`
    }
  }
}

module.exports = function () {
  got
    .head('baidu.com')
    .then(() => {
      const gemMine = getConfig(path.join(ROOT, '.gem-mine'))
      const prefix = '🚀  '
      let message = ''
      const cliMessage = checkCliVersion()
      if (cliMessage) {
        message += `${prefix}${cliMessage}`
      }
      const templateInfo = checkTemplateVersion(gemMine)
      const uiInfo = checkUIVersion(gemMine)
      if (templateInfo || uiInfo) {
        if (cliMessage) {
          message += '\n\n\n'
        }
        if (templateInfo) {
          message += `${prefix}${templateInfo}\n`
        }
        if (uiInfo) {
          message += `${prefix}${uiInfo}\n`
        }
        message += `请执行 ${chalk.yellow('gem-mine update')} 进行更新`
      }

      print.box({ message })
    })
    .catch(e => {
      process.exit(0)
    })
}
