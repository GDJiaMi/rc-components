import React from 'react'
import { AdminLayout, Link, Title } from '@gdjiami/rc-components'

export default class ErrorPage extends React.Component {
  public render() {
    return (
      <AdminLayout.Body>
        <Title>通用错误页面</Title>
        <div>
          <Link to="/404">404</Link>
        </div>
        <div>
          <Link to="/401">401</Link>
        </div>
        <div>
          <Link to="/403">403</Link>
        </div>
        <div>
          <Link to="/500">500</Link>
        </div>
      </AdminLayout.Body>
    )
  }
}
