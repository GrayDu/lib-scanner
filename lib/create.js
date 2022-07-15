const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')
const ora = require('ora')
const utills = require('./utils')

module.exports = async function () {
  const fileName = 'project-libs'
  const outputPath = path.join(process.cwd(), fileName + '.json')
  const spinner = ora(`start...`)
  spinner.start()
  utills.readPackages().then(json => {
    const res = fs.writeJson(outputPath, json.data, { spaces: 2 })
    res.then(() => {
      spinner.succeed(chalk.green('write file done, and the file is outputed in ') + chalk.cyan(outputPath))
    }).catch(err => {
      spinner.fail(chalk.red(err.message))
    })
  }).catch(err => {
    spinner.fail(chalk.red(err.msg))
  })
}