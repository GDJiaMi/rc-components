/**
 * run: yarn parcel -- ./components/AdminLayout/example/index.html
 */
import React from 'react'
import ReactDOM from 'react-dom'
import AdminLayout from '../index'
import '../style/css'
import './style.css'

/**
 * 定义菜单项，支持嵌套
 */
const menu = [
  {
    path: '/',
    title: '首页',
    icon: 'book',
  },
  {
    path: '/settings',
    title: '设置',
    icon: 'setting',
    children: [
      {
        path: '/settings/clients',
        title: '客户端',
        icon: 'tablet',
      },
      {
        path: '/settings/app',
        title: '应用',
        icon: 'star',
      },
    ],
  },
  {
    title: '统计',
    icon: 'bar-chart',
    children: [
      {
        path: '/stat/a',
        title: '订单',
        icon: 'file',
      },
    ],
  },
]

class App extends React.Component {
  public state: {
    path: string
  } = {
    path: '/',
  }
  public render() {
    const Link = this.Link
    return (
      <AdminLayout
        Link={Link as any}
        siteName="exmaple"
        title="hello world"
        logo={require('./icon.png')}
        menus={menu}
        dropdown={<div>dropdown</div>}
        path={this.state.path}
      >
        <AdminLayout.View>
          <AdminLayout.HeaderBar>HeaderBar</AdminLayout.HeaderBar>
          <AdminLayout.Body>
            <h1>{this.state.path}</h1>
          </AdminLayout.Body>
        </AdminLayout.View>
      </AdminLayout>
    )
  }

  private Link = (props: {
    to: string
    children?: React.ReactNode
    className?: string
  }) => {
    return (
      <a
        className={props.className}
        href={props.to}
        onClick={evt => {
          evt.preventDefault()
          this.setState({ path: props.to })
        }}
      >
        {props.children}
      </a>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
