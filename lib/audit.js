const path = require('path')
const ora = require('ora')
const exec = require('child_process').exec
const utils = require('./utils')
const fs = require('fs-extra')
const npmRegistry = 'https://registry.npmjs.org/'
const Arborist = require('@npmcli/arborist')
const Report = require('npm-audit-report')

class Audit {
  constructor (options) {
    this.filepath = path.join(process.cwd(), 'audit-log.json')
    this.options = options
    this.outList = []
    this.auditList = []
    this.registry = ''
  }

  async start() {
    const spinner = ora('start aduit...')
    spinner.start('start check outdated npm packages...')
    await this.checkOutdate()
    if (this.outList.length === 0) {
      utils.log('\n no package needs to update', 'nor')
    }
    try {
      utils.log('outdated npm packages check done', 'nor')
      spinner.start('start auditing...')
      await this.execAudit();
      utils.log('\n audit done', 'nor')
      utils.log('\n start to write result into file', 'nor')
      if (this.registry) {
        exec('npm config set registry ' + this.registry)
      }
      await this.checkIsDev()
      const content = {
        outdated: this.outList,
        audit: this.auditList
      }
      const filepath = path.join(process.cwd(), './audit-log.json')
      fs.writeJson(filepath, content, {spaces: 2}).then(() => {
        spinner.succeed('The audit result is outputed in ' + filepath)
      }).catch(err => {
        spinner.fail('write file error')
        utils.log('Error:' + err.message)
      })
    } catch (error) {
      spinner.fail('Error')
      console.log(error);
    }
  }

  // 检查过期的依赖包
  checkOutdate () {
    return new Promise((resolve, reject) => {
      exec('npm outdated --json', (_error, stdout, stderr) => {
        if(_error) { 
          utils.log(stderr)
        }
        stdout = JSON.parse(stdout)
        for (let key in stdout) {
          const one = stdout[key]
          if (one.current && one.wanted && one.current !== one.wanted) {
            this.outList.push({ name: key, cur: one.current, wanted: one.wanted, latest: one.latest})
          }
        }
        resolve()
      })
    })
  }

  // npm 检查报告
  async execAudit () {
    return new Promise((resolve, reject) => {
      exec('npm get registry', (_error, out) => {
        this.registry = out;
        if (out !== npmRegistry) {
          exec('npm config set registry ' + npmRegistry, () => {
            this.auditFn().then(() => {
              resolve()
            }).catch(() => {
              reject()
            })
          })
        } else {
          this.auditFn().then(() => {
            resolve()
          }).catch(() => {
            reject()
          })
        }
      })
    })
  }

  async auditFn () {
    const arb = new Arborist({ path: process.cwd() })
    await arb.audit().then(report => {
      const result = Report(report, { reporter: 'json' })
      if (result && result.report) {
        const data = JSON.parse(result.report)
        if (data.metadata.vulnerabilities.total > 0) {
          for (let key in data.vulnerabilities) {
            const vi = data.vulnerabilities[key]
            if (vi.via.length > 0 && typeof vi.via[0] === 'string') {
              this.auditList.push({ level: vi.severity, message: '', package: vi.name, path: vi.nodes, referrer: '', range: vi.range, isdev: false })
            } else {
              vi.via.forEach(ele => {
                this.auditList.push({ level: ele.severity, package: ele.name, message: ele.title, path: vi.nodes, referrer: ele.url, range: ele.range, isdev: false })
              })
            }
          }
        }
      }
    })
  }

  // 判断是否为dev包
  async checkIsDev () {
    const res = await utils.readPackages()
    if (res.data && res.data.dev) {
      this.auditList.forEach((item, i) => {
        const find = res.data.dev.some(one => {
          return one.name === item.package
        })
        item.isdev = find ? true : false
        this.auditList.splice(i, 1, item)
      })
    }
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
}

module.exports = Audit