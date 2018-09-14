/**
 * 首页
 */
import React from 'react'
import { Title, AdminLayout } from '@gdjiami/rc-components'

export default class Home extends React.Component {
  public render() {
    return (
      <AdminLayout.Body>
        <Title.Title>首页</Title.Title>
        Home
      </AdminLayout.Body>
    )
  }
}
