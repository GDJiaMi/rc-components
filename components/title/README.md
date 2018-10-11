# Title

用于声明页面的标题

## 使用

TODO:

## 支持面包屑

实现难度:

- 支持嵌套路由
- 需要保持代码 Dry
- 与具体组件解耦, 不耦合于路由规则
- 支持国际化, 即支持 title 异步/动态渲染
- 支持路由变量自动填充, 如`<Title link=":id">订单详情</Title>`
- 非嵌套组件(单独的页面)，但是存在父子关联，如果实现面包屑。如/orders 和 /orders/:id.
  -> 只能透过嵌套路由来实现，可以见下面的示例

解决办法:

1.  封装 react-router v4 的`Route`组件. 在 Route 中传入连接等参数

```jsx
function render() {
  return (
    <Switch>
      <Route path="/" component={Home} title="home" />
      <Route path="/a" component={A} title={<span>a</span>} />
      <Route path="/b" title={props => <span>b-{props.match.params.id}</span>}>
        {/* index */}
        <Route path="/b" exact component={B} />
        <Route
          path="/b/:id"
          component={BDetail}
          title={props => <span>b-{props.match.params.id}</span>}
        />
      </Route>
    </Switch>
  )
}
```

好处：

- 页面不需要关心 title 渲染
- 页面和路由配置规则解耦
- 支持路由嵌套
- 可以精确获取路由匹配信息

坏处:

- title 渲染可能不够灵活，比如需要远程获取数据动态渲染的 title
- 非路由式页面可能无法工作，比如 tab

---

2.  显式传入

link props 支持路由参数, 由 Provider 根据传入的 location 对象进行解析

```jsx
<div>
  <Title link="/b/:id">hello world</Title>
</div>
```

好处：

- title 渲染灵活

坏处

- 连接需要显式传入，导致页面组件和路由匹配规则耦合. 如果 link props 可以设置为相对路径则会好一些,

> 相对路径，不像 react-router V3，使用声明文件声明路由规则，在 V4 中，没有路由配置的上下文，所有很难使用相对路径.
> 在 Provider 内部使用一个 titles 栈来保存 Title 的声明，所以相对路径可以相对于上一个匹配项, 例如
> ['/', 'a', 'b'], 路径 b 的完整路径可以为 /a/b

3.  两者结合

最终的决议是支持以上两个，以适配不同的场景
