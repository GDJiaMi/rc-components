# CHANGELOG

## 0.2.0(2018.12.27)

### ✋ Break Change

- 依赖 React 16.7 新的组件将使用 react hooks API 开发
- 绑定 antd(3.8.4) 版本，依赖 rc-components 的应用不再需要显式添加 antd 依赖.
- 移除`lib`导出, 只支持 esmodule 形式. 这里需要将 babel-import-plugin 的配置修改为:
  ```json
  {
    "libraryName": "@gdjiami/rc-components",
    "libraryDirectory": "es",
    "style": "css"
  }
  ```
  另外需要将所有`@gdjimia/rc-components/lib/*`导入修改为`@gdjimia/rc-components/es/*`
- Query 重构为 Query.Provider,
  - FatTable 依赖 Query.Provider, 所以需要在根组件中添加
  - withQuery 接口也有变动 get-> getter, 新增 setter. 旧版的 get 方法获取的是过滤命名空间后的对象
  - 新增 useQuery

### ⛔️ 废弃

- `Icon` 组件。应该使用 svgr。`jm-cli`现已支持 svgr， 将 svg 转换为 React 组件
- `Query`，使用 query Provider 配合 withQuery 获取 useQuery 使用

### 🎉 新增

- `@gdjiami/rc-components/es/hooks`暴露了一些 React Hooks, 用于取代高阶组件，让代码更加简洁. 目前包含以下 hooks
  - useQuery 用于取代 withQuery
  - useAcl 用于取代 withAcl
  - useUpdate 返回一个回调，用于强制刷新
  - useRouter 用于获取当前router
- `Ellipsis`: 支持单行、多行文本省略
- `ProgressSpin`： 使用 nProgress 形式的 Spin
- `UserSearchComboBox`: 自动补全形式的用户搜索器
- `AdminLayout改进`:
  - menu icon 支持自定义图标
  - 默认支持持久化折叠状态
- `SearchableSelect`: 可搜索下拉列表，Select 组件的封装
- `ComboBox`: AutoComplete 组件的封装，接口和 SearchableSelect 一致
- `ComponentLoading`: 可以用于 React Suspend fallback 属性
- `lazy` 封装 react lazy 方法, 上层不再需要包裹 Suspend 组件（容易导致 bug）
- 引入 `docz` 作为文档生成器
