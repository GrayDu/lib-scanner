# 安装

```
  # global install
  $ npm install -g lg-scanner
```

# 使用

```
  # 查询项目的依赖包
  $ lg-scanner init

  {
    // 依赖的所有三方包
    "total": [
      {
        // 包名
        "name": "@gar/promisify", 
        // 版本号
        "version": "1.1.3",
        "lib": "@gar/promisify@1.1.3",
        // 是否开发环境依赖
        "isdev": false
      },
      ...
    ],
    // 仅开发环境依赖
    "dev": [
      {
        "name": "@npmcli/installed-package-contents",
        "version": "^1.0.7",
        "lib": "@npmcli/installed-package-contents@^1.0.7",
        "isdev": true
      },
      ...
    ],
    // 生产环境依赖
    "pro": [
      {
        "name": "@gar/promisify",
        "version": "1.1.3",
        "lib": "@gar/promisify@1.1.3",
        "isdev": false
      },
      ...
    ]

  }


  # 执行npm audit 检查并输出结果
  $ lg-scanner audit

  # 输出结果示例
  {
    // 老版本依赖包
    "outdated": [
      {
        "name": "axios", // 包名
        "cur": "5.0.1", // 当前安装版本
        "wanted": "5.0.1", // 建议安装版本
        "latest": "6.0.5" // 最新版本
      }
    ],
    // npm 漏洞包检查
    "audit": [{
      // 严重等级 取值['ciritical', 'high', 'moderate', 'low']
      "level": "critical", 
      // 漏洞原因（可能为空）
      "message": "Prototype Pollution in minimist ",
      // 包名
      "package": "minimist",
      // 当前包在 node_modules文件夹下的路径
      "path": [], 
      // 漏洞影响版本
      "range": "<2.0.0", 
      // 漏洞具体信息参考网址（可能为空）
      "referrer": "https://github.com/advisories/GHSA-xvch-5gv4-984h" 
    }]
  }
```

## audit range 说明

* range: "<2.0.0" 小于版本号a(不包含版本号a)的包存在漏洞
* range": "<=2.2.0" 小于等于版本号a的包存在漏洞
* range: ">2.0.0" 大于版本号a(不包含版本号a)的包存在漏洞
* range": ">=2.2.0" 大于等于版本号a的包存在漏洞
* range: "1.7.2 - 1.7.5" 版本号a(包含版本a)至版本号b(包含版本b)的包存在漏洞
* range: ">=6.0.0 <6.1.2" 大于等于a版本号且小于b版本的包存在漏洞
* range: "0.3.0 - 1.4.1 || 2.0.0 - 2.0.1" 版本号a(包含版本a)至版本号b(包含版本b) 或 版本号c(包含版本c)至版本号d(包含版本d) 的包存在漏洞
