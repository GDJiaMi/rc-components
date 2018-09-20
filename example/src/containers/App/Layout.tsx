/**
 * 后台布局
 */
import React from 'react'
import { AdminLayout, Title, WindowTabs, Acl } from '@gdjiami/rc-components'
import { AclInjectedProps } from '@gdjiami/rc-components/lib/acl'
import { Dropdown, Menu } from 'antd'
import { ClickParam } from 'antd/lib/menu'
import history from '@src/history'
import menus from './menus'

const logo = require('./logo.png')

interface Props extends AclInjectedProps {
  path: string
}

export class Layout extends React.Component<Props> {
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
            <Dropdown
              overlay={
                <Menu onClick={this.handleMenuClick}>
                  <Menu.Item key="logout">退出登录</Menu.Item>
                </Menu>
              }
            >
              <AdminLayout.Action>
                <AdminLayout.Avatar src={logo} />
              </AdminLayout.Action>
            </Dropdown>
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

  private handleMenuClick = (params: ClickParam) => {
    if (params.key === 'logout') {
      history.replace('/login')
    }
  }
}

export default Acl.withAcl(Layout)
