/**
 * 后台布局
 */
import React from 'react'
import { AdminLayout, Title } from '@gdjiami/rc-components'
import menus from './menus'

const logo = require('./logo.png')

export default class Layout extends React.PureComponent<{
  path: string
}> {
  public render() {
    return (
      <AdminLayout
        siteName="后台模板"
        title={<Title.Display breadcrumb inline />}
        logo={logo}
        path={this.props.path}
        menus={menus}
        after={
          <>
            <AdminLayout.Action>One</AdminLayout.Action>
            <AdminLayout.Action>
              <AdminLayout.Avatar src={logo} />
            </AdminLayout.Action>
          </>
        }
      >
        <AdminLayout.View>
          {this.props.children}
          <AdminLayout.Footer>版本号 Power By GZB</AdminLayout.Footer>
        </AdminLayout.View>
      </AdminLayout>
    )
  }
}
