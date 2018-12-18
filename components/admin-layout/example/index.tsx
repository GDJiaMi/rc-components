/**
 * run: yarn parcel -- ./components/AdminLayout/example/index.html
 */
import React from 'react'
import ReactDOM from 'react-dom'
import AdminLayout from '../index'
import '../style/css'
import './style.css'
import Icon from 'antd/es/icon'
import 'antd/es/icon/style/css'
import Dropdown from 'antd/es/dropdown'
import 'antd/es/dropdown/style/css'

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
    path: '/stat',
    children: [
      {
        path: '/stat/a',
        title: '订单',
      },
      {
        path: '/stat/b',
        title: '用户',
      },
    ],
  },
]

class App extends React.Component {
  public state: {
    path: string
    showError?: boolean
  } = {
    path: '/stat/b',
    showError: true,
  }
  public render() {
    const Link = this.Link
    return (
      <AdminLayout
        Link={Link as any}
        siteName="Example"
        title="hello world"
        logo={require('./icon.png')}
        // error={
        //   this.state.showError ? new Error('会话失效, 请重新登录') : undefined
        // }
        menus={menu}
        path={this.state.path}
        after={
          <>
            <AdminLayout.Action>
              <Icon type="search" />
            </AdminLayout.Action>
            <AdminLayout.Action>
              <Icon type="question" />
            </AdminLayout.Action>
            <Dropdown overlay={<div>dropdown</div>}>
              <AdminLayout.Action>
                <AdminLayout.Avatar src={require('./icon.png')} />
                管理员
              </AdminLayout.Action>
            </Dropdown>
          </>
        }
      >
        <AdminLayout.View>
          <AdminLayout.HeaderBar>HeaderBar</AdminLayout.HeaderBar>
          <AdminLayout.Body>
            <h1>{this.state.path}</h1>
            <p>
              <button onClick={this.toggleShowError}>显示错误信息</button>
            </p>
          </AdminLayout.Body>
          <AdminLayout.Footer>
            CopyRight @ 2018 GZB_TEST v0.1
          </AdminLayout.Footer>
        </AdminLayout.View>
      </AdminLayout>
    )
  }

  private toggleShowError = () => {
    this.setState({
      showError: !this.state.showError,
    })
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
