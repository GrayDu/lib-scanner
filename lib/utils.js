const chalk = require('chalk')
const fs = require('fs-extra')

// 判断是否为大写
const isCaps =  str => {
  const c = str.charAt(0)
  return !(c<'A' || c>'Z')
}

// 输出
const log = (msg, type = 'fail') => {
  if (type === 'fail') {
    console.log(chalk.red(msg))
  } else if (type === 'suc'){
    console.log(chalk.green(msg))
  } else {
    console.log(chalk.cyan(msg))
  }
}

// 判断是否是空白
const checkBlank = str => {
  const reg = /[0-9a-zA-Z:/]/i
  return reg.test(str)
}


// 判断是否为告警等级
const isLevel = str => {
 const levelReg = /^.*(Low|Moderate|High|Critical).*$/i

 return levelReg.test(str)
}

const writeFile = (stdout, filepath) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filepath, stdout, err => {
      if (err) {
        reject(err)
      } else {
        resolve(filepath)
      }
    })
  })
}


module.exports = {
  isCaps,
  log,
  checkBlank,
  isLevel,
  writeFile
}