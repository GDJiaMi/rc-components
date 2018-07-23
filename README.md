# React Components

React 组件库， 收集了工作宝 Web 应用，以及管理后台常用的组件或套件. 致力于减少应用开发的代码重复，提高维护效率

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

TODO

* [工作宝web应用开发规范](style-guide.md)

## License

This project is licensed under the terms of the
[MIT license](LICENSE).