# React Components

React 组件库， 收集了工作宝中后台应用的常用组件或套件. 致力于减少应用开发的代码重复，提高维护效率

## Installation

```shell
yarn add @gdjiami/rc-components

# 依赖
yarn add react react-dom tslib
```

## Usage

所有组件都在`lib`或`es`目录下，lib 目录使用 CommonJS 模块系统， 而 es 使用 ES6 模块系统，另外两个目录下面都有 Typescript 声明文件，所以支持类型检查，开发者可以按需导入需要的组件

```typescript
import React from 'react'
import Time from '@gdjiami/rc-components/lib/Time'

export default () => {
  return <Time time={Date.now()} />
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

* [工作宝 web 应用开发规范](style-guide.md)

### 组件列表

- [`AdminLayout`](components/AdminLayout/README.md) 后台布局组件
- [`BackBar`](components/BackBar/README.md) 二级页面返回栏
- [`Title`](components/Title/README.md) 标题设置和展示，支持面包屑

### 运行实例

每个组件目录下都有一个example目录，可以直接通过`parcel`命令进行执行，例如:

```shell
yarn parcel -- components/AdminLayout/example/index.html
```


## License

This project is licensed under the terms of the
[MIT license](LICENSE).
