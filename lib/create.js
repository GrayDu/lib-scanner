const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')
const ora = require('ora')
const FormateData = require('./formateData')

module.exports = async function (options) {
  const cwd = process.cwd()
  const fileName = 'project-libs'
  const outputPath = path.join(cwd, fileName + '.json')
  const spinner = ora(`start reading file...`)
  spinner.start()
  fs.readFile(path.join(cwd, 'package-lock.json'), 'utf-8', (err, dataStr) => {
    if (err) {
      return console.log(chalk.red(err.message))
    } else {
      console.log(chalk.grey('processing data'))
      const formateData = new FormateData(fileName, outputPath, JSON.parse(dataStr))
      let a = formateData.start()
      console.log(chalk.grey('data process done'))
      console.log(chalk.grey('start write file'))
      fs.writeFile(outputPath, JSON.stringify(a), err => {
        if (err) {
          console.log(chalk.grey('write file failed'))
          return spinner.fail(chalk.red(err.message))
        } else {
          return spinner.succeed(chalk.green('write file done, and the file is outputed in ') + chalk.cyan(outputPath))
        }
      })
    }
  })

}