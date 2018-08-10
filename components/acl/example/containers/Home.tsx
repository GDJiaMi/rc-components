import React from 'react'
import { observer } from 'mobx-react'
import { observable } from 'mobx'
import Checkbox from 'antd/lib/checkbox'
import AdminLayout from '../../../admin-layout'
import store from '../store'
import Acl from '../../index'
import { Role } from '../constants'

const { Choose, Option, Switch, Allows } = Acl

@observer
export default class Home extends React.Component {
  @observable and: boolean = true
  @observable or: boolean = false

  public render() {
    return (
      <AdminLayout.View>
        <AdminLayout.Body>
          <h2>切换角色</h2>
          <button onClick={this.setAdmin}>Admin</button>
          <button onClick={this.setGuest} style={{ marginLeft: '1em' }}>
            Guest
          </button>
          <h2>Choose</h2>
          <Choose>
            <div>通配模式1</div>
            <Option action="*">
              <div>通配模式2</div>
            </Option>
            <Option action="create">
              <div>create</div>
            </Option>
            <Option action="update">
              <div>update</div>
            </Option>
            <Option action="view">
              <div>view</div>
            </Option>
            <Option action={['update', 'view']}>
              <div>update or view</div>
            </Option>
            <Option role={Role.Admin}>
              <div>Admin</div>
            </Option>
            <Option role={Role.Guest}>
              <div>Guest</div>
            </Option>
            <Option role={[Role.Guest, Role.Admin]}>
              <div>Guest or Admin</div>
            </Option>
          </Choose>

          <h2>Switch</h2>

          <Switch>
            <Option action="create">
              <div>create</div>
            </Option>
            <Option action="update">
              <div>update</div>
            </Option>
            <Option action={['update', 'view']}>
              <div>update or view</div>
            </Option>
            <Option action="view">
              <div>view</div>
            </Option>
          </Switch>

          <h1>Allows</h1>
          <label>
            AND 条件
            <Checkbox
              checked={this.and}
              onChange={v => (this.and = v.target.checked)}
            />
          </label>
          <label>
            OR 条件
            <Checkbox
              checked={this.or}
              onChange={v => (this.or = v.target.checked)}
            />
          </label>
          <Allows
            action="create"
            otherwise={<div>don't allows create</div>}
            and={this.and}
            or={this.or}
          >
            <div>allows create</div>
          </Allows>

          <h1>Allows All</h1>
          <Allows
            action={['create', 'view', 'update']}
            otherwise={<div>don't allows</div>}
            type="all"
          >
            <div>allows create & view & update</div>
          </Allows>

          <h1>Allows Some</h1>
          <Allows
            action={['create', 'view', 'update']}
            otherwise={<div>don't allows</div>}
            type="some"
          >
            <div>allows one of create, view, update</div>
          </Allows>
        </AdminLayout.Body>
      </AdminLayout.View>
    )
  }

  private setAdmin = () => {
    store.role = Role.Admin
  }

  private setGuest = () => {
    store.role = Role.Guest
  }
}
