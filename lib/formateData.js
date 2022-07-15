const chalk = require('chalk')

class FormateData {
  constructor (content){
    this.content = content
  }

  start() {
    let res = { total : [], dev: [], pro: [] }
    if (this.content.hasOwnProperty('dependencies')) {
      this.pushItem(this.content.dependencies, res.total)
      
      res.dev = res.total.filter(item => {
        return item.isdev
      })

      res.pro = res.total.filter(item => {
        return !item.isdev
      })
    } else {
      console.log(chalk.red('当前项目package-lock.json文件格式有误'))
    }
    return res
  }

  pushItem(obj, resArr, isdev = false) {
    for(let key in obj) {
      const value = obj[key]
      const lib = key + '@' + ( value.version ? value.version : value )
      const dev = value.hasOwnProperty('dev') ? value.dev : isdev
      const find = resArr.findIndex(arrItem => {
        return arrItem.lib === lib
      })
      if (find === -1) {
        resArr.push({
          "name" : key,
          "version": value.version || value,
          "lib": lib,
          'isdev': dev
        })
      }
      if (value.hasOwnProperty('requires')) {
        this.pushItem(value.requires, resArr, dev)
      }
    }
  }

}

module.exports = FormateData