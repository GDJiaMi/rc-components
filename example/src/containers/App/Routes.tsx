/**
 * 全局路由配置
 */
import React from 'react'
import { Switch, Route, Redirect } from 'react-router'
import { ErrorPage } from '@gdjiami/rc-components'
import { loadComponent } from '@src/utils'
import Layout from './Layout'

const Login = loadComponent(() => import('@src/containers/Login'))
const Home = loadComponent(() => import('@src/containers/Home'))

export default (props: {}) => {
  return (
    <Switch>
      <Route path="/403" component={ErrorPage.Forbidden} />
      <Route path="/401" component={ErrorPage.Unauthorized} />
      <Route path="/500" component={ErrorPage.InternalError} />
      <Route path="/404" component={ErrorPage.NotFound} />
      <Route path="/login" component={Login} />
      <Route
        path="/"
        render={({ location }) => (
          <Layout path={location.pathname}>
            <Switch>
              {/* 管理后台内页 */}
              <Route path="/" exact component={Home} />
              <Route>
                <Redirect to="/404" />
              </Route>
            </Switch>
          </Layout>
        )}
      />
    </Switch>
  )
}
