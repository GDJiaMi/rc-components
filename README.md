# React Components

React 组件库， 收集了工作宝中后台应用的常用组件或套件. 致力于减少应用开发的代码重复，提高维护效率

[DEMO](http://demo.ejiahe.com/api/rc-components/#/)

## Installation

```shell
yarn add @gdjiami/rc-components

# 依赖
yarn add react react-dom tslib react-router react-router-dom
```

## Usage

所有组件都在`lib`或`es`目录下，lib 目录使用 CommonJS 模块系统， 而 es 使用 ES6 模块系统，另外两个目录下面都有 Typescript 声明文件，所以支持类型检查，开发者可以按需导入需要的组件

`rc-components` 支持类似于`antd`的按需加载方式，如果你使用 typescript 可以使用[`ts-import-plugin`](https://github.com/Brooooooklyn/ts-import-plugin) 插件, 例如：

```js
// webpack.config.js
const tsImportPluginFactory = require('ts-import-plugin')

module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.(jsx|tsx|js|ts)$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
          getCustomTransformers: () => ({
            before: [
              tsImportPluginFactory([
                // 按需导入antd组件
                {
                  libraryName: 'antd',
                  libraryDirectory: 'lib',
                  style: 'css',
                },
                // 按需导入rc-components组件
                {
                  libraryName: '@gdjiami/rc-components',
                  libraryDirectory: 'lib',
                  style: 'css',
                },
              ]),
            ],
          }),
        },
        exclude: /node_modules/,
      },
    ],
  },
  // ...
}
```

> 对于`babel`可以使用[`babel-plugin-import`](https://github.com/ant-design/babel-plugin-import) 插件

使用示例

```typescript
import React from 'react'
import { Login } from '@gdjiami/rc-components'
import { message } from 'antd'
import { delay } from './utils'

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

  private handleSubmit = async () => {
    await delay(2000)
  }

  private handleSuccess = () => {
    message.success('登录成功')
  }
}
```

## Doc

rc-components 是基于 antd 组件库之上的高层组件库，旨在抽象重复的业务场景， 减少代码重复。其中耦合的东西有：

- antd
- react, react-dom
- tslib
- react-router v4
- lodash

这些耦合的技术是 rc-components 的构建基础，而且在团队内的应用是比较稳定的、静态的，近期不会有大的变动。相对的，有些东西是我们
要避免耦合的：

- 状态管理库，如 mobx，redux.
- Ajax 请求库
- 前端路由类型

**其他**

- [工作宝 web 应用开发规范](style-guide.md)

### 组件列表

- [`AdminLayout`](components/AdminLayout/README.md) 后台布局组件
- [`BackBar`](components/BackBar/README.md) 二级页面返回栏
- [`Title`](components/Title/README.md) 标题设置和展示，支持面包屑

### 运行实例

每个组件目录下都有一个 example 目录，可以直接通过`parcel`命令进行执行，例如:

```shell
yarn parcel -- components/AdminLayout/example/index.html
```

## License

This project is licensed under the terms of the
[MIT license](LICENSE).
