/**
 * 全局路由配置
 */
import React from 'react'
import { observer } from 'mobx-react'
import { Switch, Redirect } from 'react-router'
import { ErrorPage, Route, Acl } from '@gdjiami/rc-components'
import { loadComponent } from '@src/utils'
import { Rules } from '@src/constants'
import Layout from './Layout'
import store from './store'

const Login = loadComponent(() => import('@src/containers/Login'))
const Home = loadComponent(() => import('@src/containers/Home'))
const UserSelectDemo = loadComponent(() => import('@src/containers/UserSelect'))
const ErrorPageDemo = loadComponent(() => import('@src/containers/ErrorPage'))
const FatModalDemo = loadComponent(() => import('@src/containers/FatModal'))
const AclDemo = loadComponent(() => import('@src/containers/Acl'))
const Ellipsis = loadComponent(() => import('@src/containers/Ellipsis'))
const FooterToolbarDemo = loadComponent(() =>
  import('@src/containers/FooterToolbar'),
)
const SplitDemo = loadComponent(() => import('@src/containers/Split'))
const FatTableBase = loadComponent(() =>
  import('@src/containers/FatTable/Base'),
)
const FatTableCustomLayout = loadComponent(() =>
  import('@src/containers/FatTable/CustomLayout'),
)
const FatTableSelect = loadComponent(() =>
  import('@src/containers/FatTable/Select'),
)

@observer
export default class Routes extends React.Component {
  public render() {
    return (
      <Acl.Provider role={store.role} rules={Rules}>
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
                  <Route path="/user-select" component={UserSelectDemo} />
                  <Route path="/error-page" component={ErrorPageDemo} />
                  <Route path="/acl" component={AclDemo} />
                  <Route
                    path="/fat-modal"
                    title="富模态框组件"
                    component={FatModalDemo}
                  />
                  <Route path="/footer-toolbar" component={FooterToolbarDemo} />
                  <Route
                    path="/ellipsis"
                    title="多行省略"
                    component={Ellipsis}
                  />
                  <Route
                    path="/split"
                    title="可拖动分割组件"
                    component={SplitDemo}
                  />
                  <Route path="/fat-table" title="富表格组件">
                    <Switch>
                      <Route path="/fat-table/base" component={FatTableBase} />
                      <Route
                        path="/fat-table/custom-layout"
                        component={FatTableCustomLayout}
                      />
                      <Route
                        path="/fat-table/operation"
                        component={FatTableSelect}
                      />
                    </Switch>
                  </Route>
                  <Route>
                    <Redirect to="/404" />
                  </Route>
                </Switch>
              </Layout>
            )}
          />
        </Switch>
      </Acl.Provider>
    )
  }
}
