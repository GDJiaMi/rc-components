import React from 'react'
import { Login } from '@gdjiami/rc-components'
import { Params } from '@gdjiami/rc-components/lib/login/Login'

export default class LoginPage extends React.Component {
  public render() {
    return <Login onSubmit={this.handleSubmit} />
  }

  private handleSubmit = async (params: Params) => {
    // 登录鉴权代码
  }
}
