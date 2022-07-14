const path = require('path')
const ora = require('ora')
const exec = require('child_process').exec
const utils = require('./utils')
class Audit {
  constructor (options) {
    this.filepath = path.join(process.cwd(), 'audit-log.json')
    this.options = options
    this.outList = []
    this.auditList = []
  }
  start() {
    const spinner = ora('start aduit...')
    spinner.start('start check outdated npm packages...')
    this.checkOutdate().catch(() => {
      utils.log('\n no package needs to update')
    }).finally(() => {
      utils.log('outdated npm packages check done', 'nor')
      spinner.start('start execute npm audit...')
      this.execAudit().then(() => {
        utils.log('\n npm audit execute done', 'nor')
        utils.log('\n start to write result into file', 'nor')
        const content = {
          outdated: this.outList,
          audit: this.auditList
        }
        utils.writeFile(JSON.stringify(content), path.join(process.cwd(), './audit-log.json')).then(res => {
          spinner.succeed('The audit result is outputed in ' + res)
        }).catch(err => {
          spinner.fail('write file error')
          utils.log('Error:' + err.message)
        })
      })
    })
  }
  // 检查过期的依赖包
  checkOutdate() {
    return new Promise((resolve, reject) => {
      exec('npm outdated', (error, stdout, stderr) => {
        if (stdout.length > 0) {
          stdout = stdout.replace(/\n/g, ' ')
          let stdArr = stdout.split(' ').filter(item => {
            return item != ''
          })
          stdArr.splice(0, 5)
          for (let i = 0; i < stdArr.length;) {
            this.outList.push({
              name: stdArr[i],
              cur: stdArr[i + 1],
              wanted: stdArr[i + 2],
              latest: stdArr[i + 3],
            })
            i = i + 5
          }
          this.outList = this.outList.filter(item => {
            item.cur != item.wanted
          })
          if (this.outList.length === 0) {
            reject()
          } else {
            resolve()
          }
        } else {
          reject()
        }
      })
    })
  }

  // 一键升级过期包
  autoUpdate () {
    this.checkOutdate().then(() => {
      if (this.outList.length === 0) {
        utils.log('暂无需要升级的依赖包')
        return
      } else {
        let cdmStr = 'npm i '
        this.outList.forEach(item => {
          cdmStr += `${item.name}@${item.wanted} `
        })
        exec(cdmStr)
      }
    }).catch(() => {
      utils.log('暂无需要升级的依赖包')
    })
  }

  // npm audit
  execAudit () {
    return new Promise ((resolve, reject) => {
      exec('npm audit', (error, stdout, stderr) => {
        stdout = stdout.replace(/\x1B|39m|90m|\[/g, '')
        if (stdout.length === 0) {
          reject()
        }
        const stdArr = stdout.split('\n').filter(item => {
          return utils.checkBlank(item)
        })
        stdArr.forEach((item,index) => {
          item = item.replace(/\s+/g, ' ')
          stdArr.splice(index, 1, item)
        })
        for(let i = 0; i < stdArr.length;) {
          if (utils.isLevel(stdArr[i]) && !utils.checkBlank(stdArr[i][0])) {
            const comArr = stdArr.slice(i);
            const index = comArr.findIndex(item => {
              return item.indexOf('More info') > -1
            })
            const slicedArr = stdArr.slice(i, i + index + 1)
            this.auditList.push(this.handleArr(slicedArr))
            i = i + index
          } else {
            i ++
          }
        }
        resolve()
      })
    })
  }

  handleArr (arr) {
    arr.forEach((item, index)=> {
      if (item[0] === ' ') {
        item = item.substring(1)
      }
      arr.splice(index, 1, item)
    })
    arr.forEach((item, index)=> {
      if (!utils.isCaps(item[0])) {
        arr[index - 1] += (' ' + item)
      }
    })
    arr = arr.filter(item => {
      return utils.isCaps(item[0])
    })
    
    let obj = {}
    arr.forEach((item,index) => {
      let i = item.indexOf(' ');
      const newItem = {
        key: item.substring(0, i),
        value: item.substring(i + 1)
      }
      arr.splice(index, 1, newItem)
    })
    arr.forEach((item,index) => {
      if (utils.isLevel(item.key)) {
        obj.level = item.key
        obj.message = item.value
      }
      if (item.key.includes('Package')) {
        obj.package = item.value.split(' ')[0]
      }
      if (item.key.includes('Path')) {
        obj.path = item.value
      }
      if (item.key.includes('More')) {
        obj.referrer = item.value.split(' ')[1]
      }
      if (item.key.includes('Dependency')) {
        obj.isdev = item.value.includes('dev]')
      }
    })
    
    return obj
  }
}

module.exports = Audit