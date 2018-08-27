import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter, Route, Link, Switch } from 'react-router-dom'
import AdminLayout from '../../admin-layout'
import '../../admin-layout/style/css'
import './style.css'
import Base from './Base'
import CustomLayout from './CustomLayout'

const menus = [
  {
    path: '/',
    title: '首页',
  },
  {
    path: '/base',
    title: '基本使用',
  },
  {
    path: '/custom-layout',
    title: '自定义布局',
  },
]

class App extends React.Component {
  public render() {
    return (
      <HashRouter>
        <Route
          render={({ location }) => (
            <AdminLayout
              siteName="FatTable"
              menus={menus}
              path={location.pathname}
            >
              <AdminLayout.View>
                <Switch>
                  <Route path="/" exact>
                    <Link to="base">基础</Link>
                  </Route>
                  <Route path="/base" component={Base} />
                  <Route path="/custom-layout" component={CustomLayout} />
                </Switch>
              </AdminLayout.View>
            </AdminLayout>
          )}
        />
      </HashRouter>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
