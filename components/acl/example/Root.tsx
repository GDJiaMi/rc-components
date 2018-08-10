import React from 'react'
import { Switch, Route, RouteComponentProps } from 'react-router'
import Acl, { AclInjectedProps } from '../'
import AdminLayout, { MenuConfig } from '../../admin-layout'
import '../../admin-layout/style/css'
import Home from './containers/Home'

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

interface RootProps extends AclInjectedProps, RouteComponentProps<{}> {}

function createSubPage(action: string) {
  @Acl.allows(action)
  class SubPage extends React.Component {
    public render() {
      return <div>{action.toUpperCase()}</div>
    }
  }
  return SubPage
}

const Create = createSubPage('create')
const Update = createSubPage('update')
const Delete = createSubPage('delete')
const View = createSubPage('view')

export class Root extends React.Component<
  RootProps,
  {
    menus: MenuConfig[]
  }
> {
  public static getDerivedStateFromProps(props: RootProps) {
    return {
      menus: props.choose(menu),
    }
  }
  public render() {
    return (
      <AdminLayout
        siteName="Test ACL"
        menus={this.state.menus}
        path={this.props.location.pathname}
      >
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/create" exact component={Create} />
          <Route path="/update" exact component={Update} />
          <Route path="/delete" exact component={Delete} />
          <Route path="/view" exact component={View} />
        </Switch>
      </AdminLayout>
    )
  }
}

export default Acl.withAcl(Root)
