import React, { SFC } from 'react'
import ReactDOM from 'react-dom'
import { Router, Switch, RouteComponentProps } from 'react-router'
import { Link } from 'react-router-dom'
import { createHashHistory } from 'history'
import { Icon, Dropdown } from 'antd'
import { Title, AdminLayout, BackBar } from '@gdjiami/rc-components'
import './style.css'

const Route = Title.Route
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
  render() {
    return (
      <Router history={createHashHistory()}>
        <Title.Provider debug>
          <AdminLayout
            siteName="example"
            title={
              <Title.Display
                breadcrumb
                style={{ display: 'inline', fontSize: '16px' }}
              />
            }
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
                  <AdminLayout.Action>管理员</AdminLayout.Action>
                </Dropdown>
              </>
            }
          >
            <AdminLayout.View>
              <Title link="/">首页</Title>
              <Switch>
                <Route
                  path="/"
                  exact
                  // @ts-ignore
                  component={Dashboard}
                  title="控制台"
                />
                <Route path="/orders" title="订单">
                  <Route
                    path="/orders"
                    exact
                    // @ts-ignore
                    component={Orders}
                  />
                  <Route path="/orders/:id" component={Order} remountOnChange />
                </Route>
              </Switch>
            </AdminLayout.View>
          </AdminLayout>
        </Title.Provider>
      </Router>
    )
  }
}

const Dashboard: SFC<{}> = () => {
  return (
    <AdminLayout.Body>
      <h1>Dashboard</h1>
    </AdminLayout.Body>
  )
}

const Orders: SFC<{}> = () => {
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
  state = {
    name: '',
  }
  componentDidMount() {
    this.setState({
      name: this.props.match.params.id,
    })
  }
  render() {
    return (
      <div>
        <BackBar>
          hello world <a>你好</a>
        </BackBar>
        <AdminLayout.Body>
          <Title link=":id">
            <span>
              订单详情-
              {this.state.name}
            </span>
          </Title>
          <h1>{this.state.name}</h1>
          <p>balbalaba</p>
        </AdminLayout.Body>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
