# 安装

```
  # global install
  $ npm install -g lg-scanner
```

# 使用

```
  # 查询项目的依赖包
  $ lg-scanner init


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
      "level": "Critical",  // 严重等级 取值['Ciritical', 'High', 'Moderate', 'Low']
      "message": "Prototype Pollution in minimist ", // 漏洞原因
      "package": "minimist", // 包名
      "isdev": false, // 是否开发环境依赖包
      "path": "minimist ", // 当前包在 node_modules文件夹下的路径
      "referrer": "https://github.com/advisories/GHSA-xvch-5gv4-984h" // 漏洞具体信息参考网址
    }]
  }
```
