import React from 'react'
import Acl, { AclInjectedProps } from '../'
import AdminLayout from '../../admin-layout'
import '../../admin-layout/style/css'

// TODO: 支持通配
const menu = {
  '*': {
    path: '/',
    title: 'INDEX',
    icon: 'info',
  },
  create: {
    path: '/create',
    title: 'CREATE',
    icon: 'info',
  },
  update: {
    path: '/update',
    title: 'UPDATE',
    icon: 'info',
  },
  delete: {
    path: '/delete',
    title: 'DELETE',
    icon: 'info',
  },
  view: {
    path: '/view',
    title: 'VIEW',
    icon: 'info',
  },
}

export class Home extends React.Component<AclInjectedProps> {
  state = {
    menus: this.props.choose(menu),
  }
  public render() {
    return (
      <AdminLayout siteName="Test ACL" menus={this.state.menus}>
        xhello world
      </AdminLayout>
    )
  }
}

export default Acl.withAcl(Home)
