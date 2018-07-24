/**
 * run: yarn parcel -- ./components/Title/example/index.html
 */
import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Switch, RouteComponentProps } from 'react-router'
import { Link } from 'react-router-dom'
import { createHashHistory } from 'history'
import Icon from 'antd/lib/icon'
import 'antd/lib/icon/style/css'
import Dropdown from 'antd/lib/dropdown'
import 'antd/lib/dropdown/style/css'
import { TitleProvider, Title, Display, Route } from '..'
import AdminLayout from '../../AdminLayout'
import '../../AdminLayout/style/css'
import BackBar from '../../BackBar'
import '../../BackBar/style/css'
import '../style/css'
import './style.css'

const menus = [
  {
    title: 'Dashboard',
    path: '/',
  },
  {
    title: '订单',
    path: '/orders',
  },
]

class App extends React.Component {
  public render() {
    return (
      <Router history={createHashHistory()}>
        <TitleProvider debug>
          <AdminLayout
            siteName="example"
            title={
              <Display
                breadcrumb
                style={{ display: 'inline', fontSize: '16px' }}
              />
            }
            logo={require('../../AdminLayout/example/icon.png')}
            menus={menus}
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
                    <AdminLayout.Avatar
                      src={require('../../AdminLayout/example/icon.png')}
                    />
                    管理员
                  </AdminLayout.Action>
                </Dropdown>
              </>
            }
          >
            <AdminLayout.View>
              <Title link="/">首页</Title>
              <Switch>
                <Route path="/" exact component={Dashboard} title="控制台" />
                <Route path="/orders" title="订单">
                  <Route path="/orders" exact component={Orders} />
                  <Route path="/orders/:id" component={Order} />
                </Route>
              </Switch>
            </AdminLayout.View>
          </AdminLayout>
        </TitleProvider>
      </Router>
    )
  }
}

function Dashboard(props: {}) {
  return (
    <AdminLayout.Body>
      <h1>Dashboard</h1>
    </AdminLayout.Body>
  )
}

function Orders(props: {}) {
  return (
    <AdminLayout.Body>
      <ul>
        <li>
          <Link to="orders/1">1号</Link>
        </li>
        <li>
          <Link to="orders/2">2号</Link>
        </li>
        <li>
          <Link to="orders/3">3号</Link>
        </li>
      </ul>
    </AdminLayout.Body>
  )
}

class Order extends React.Component<RouteComponentProps<{ id: string }>> {
  public state = {
    name: '',
  }
  public componentDidMount() {
    this.setState({
      name: this.props.match.params.id,
    })
  }
  public render() {
    return (
      <>
        <BackBar>
          hello world <a>你好</a>
        </BackBar>
        <AdminLayout.Body>
          <Title link=":id">订单详情-{this.state.name}</Title>
          <h1>订单详情</h1>
          <p>balbalaba</p>
        </AdminLayout.Body>
      </>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
