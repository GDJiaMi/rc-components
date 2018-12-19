---
name: 快速开始
---

# 快速开始

`rc-components` 基于`antd`, 是 MYGZB 前端团队内部使用的中后台业务组件库， 收集了 MYGZB 中后台应用的常用组件或套件. 致力于减少应用开发的代码重复，提高维护效率

### 初始化环境

#### 1. 安装

通过`jm-cli`生成项目模板:

```shell
# 安装jm-cli
$ yarn global add @gdjiami/cli

# 生成项目模板
$ jm create -t @gdjiami/app-template my-repo

# 运行项目
$ cd my-repo
```

你也可以直接下载安装 rc-components:

```shell
$ yarn add @gdjiami/rc-components

# 依赖
$ yarn add react react-dom tslib react-router react-router-dom
```

#### 2. 配置

rc-components 使用和 antd 一样的惰性加载机制，如果使用 babel 可以使用[`babel-import-plugin`](https://github.com/ant-design/babel-plugin-import), 对应的如果使用`ts-loader`可以使用[`ts-import-plugin`](https://github.com/Brooooooklyn/ts-import-plugin)来实现惰性导入。

如果使用`jm-cli`, 可以在 package.json 中配置:

```json
  "jm": {
    "importPlugin": [
      {
        "libraryName": "antd",
        "libraryDirectory": "es",
        "style": "css"
      },
      {
        "libraryName": "antd-mobile",
        "libraryDirectory": "es",
        "style": "css"
      },
      {
        "libraryName": "@gdjiami/rc-components",
        "libraryDirectory": "es",
        "style": "css"
      }
    ]
  },
```

#### 3. 使用示例

```typescript
import React from 'react'
import { Login } from '@gdjiami/rc-components'
import { message } from 'antd'
import { delay } from '~/utils'
import request from '~/utils/request'

export default class LoginPage extends React.Component {
  public render() {
    return (
      <Login
        title="登录页面"
        onSubmit={this.handleSubmit}
        onSuccess={this.handleSuccess}
      />
    )
  }

  private handleSubmit = async (params) => {
    await request(params)
    message('登录成功')
  }
}
```

### 运行

```shell
$ yarn start
```

### 构建

```shell
$ yarn build
```

### 资源

+ [jm-cli](https://carney520.github.io/jm-cli/)