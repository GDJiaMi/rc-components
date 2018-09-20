/**
 * 后台布局
 */
import React from 'react'
import { AdminLayout, Title, WindowTabs, Acl } from '@gdjiami/rc-components'
import { AclInjectedProps } from '@gdjiami/rc-components/lib/acl'
import menus from './menus'

const logo = require('./logo.png')

interface Props extends AclInjectedProps {
  path: string
}

export class Layout extends React.PureComponent<Props> {
  public render() {
    return (
      <AdminLayout
        siteName="后台模板"
        title={<Title.Display breadcrumb inline />}
        logo={logo}
        path={this.props.path}
        // @ts-ignore
        menus={this.props.choose(menus)}
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
          <WindowTabs />
          {this.props.children}
          <AdminLayout.Footer>版本号 Power By GZB</AdminLayout.Footer>
        </AdminLayout.View>
      </AdminLayout>
    )
  }
}

export default Acl.withAcl(Layout)
