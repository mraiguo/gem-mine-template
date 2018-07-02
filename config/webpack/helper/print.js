const chalk = require('chalk')
const Box = require('boxen')

function getTime() {
  const date = new Date()
  return chalk.blue(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} `)
}

function print({ message, color, time = true }) {
  let timeInfo
  if (time) {
    timeInfo = getTime()
  }
  console.log(`> ${timeInfo}${chalk[color](message)}`)
}

function printBox({ message, color = 'green', center = true }) {
  const box = Box(message, {
    padding: {
      left: 10,
      right: 10
    },
    borderColor: color,
    borderStyle: 'round',
    float: center ? 'center' : 'left'
  })

  return console.log(box)
}

module.exports = {
  print,
  info: function (message) {
    print({ message, color: 'cyan' })
  },
  warning: function (message) {
    print({ message, color: 'yellow' })
  },
  error: function (message) {
    print({ message, color: 'red' })
  },
  box: printBox
}
