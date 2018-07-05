#!/bin/env node
const path = require('path')
const execSync = require('child_process').execSync
const print = require('../helper/print')

const root = path.resolve(__dirname, '../../../')
const fix = process.env.npm_config_fix ? '--fix' : ''

const exec = function (cmd) {
  try {
    return execSync(cmd, { stdio: [process.stdin, process.stdout, process.stderr] })
  } catch (e) {}
}

exec(`stylelint "${root}/src/**/*.css" ${fix}`)
exec(`stylelint "${root}/src/**/*.scss" ${fix}`)
exec(`stylelint "${root}/src/**/*.less" ${fix}`)
exec(`eslint ${fix} --ext .js,.jsx ${root}/src ${root}/config `)

if (fix) {
  print.info('部分错误已经自动修正，剩余的请手动进行处理。可以再次运行 npm run lint 进行检查')
} else {
  print.warning('可以尝试运行 npm run lint --fix 进行错误自动修复')
}
