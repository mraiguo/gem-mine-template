const execSync = require('child_process').execSync

exports.exec = function (cmd, ext) {
  if (ext === false) {
    return execSync(cmd, {})
      .toString()
      .trim()
  } else {
    if (ext && ext.silent) {
      const params = Object.assign({}, ext)
      return execSync(cmd, params)
    } else {
      const params = Object.assign({ stdio: [process.stdin, process.stdout, process.stderr] }, ext)
      return execSync(cmd, params)
    }
  }
}
