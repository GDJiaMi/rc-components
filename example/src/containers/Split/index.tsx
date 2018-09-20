/**
 * 登录页面示例程序
 */
import React from 'react'
import { Split, AdminLayout } from '@gdjiami/rc-components'

export default class SplitDemo extends React.Component {
  public render() {
    return (
      <AdminLayout.Body>
        <Split split="vertical" className="hello">
          <div>left</div>
          <Split split="horizontal">
            <div>top</div>
            <div>right</div>
          </Split>
        </Split>
      </AdminLayout.Body>
    )
  }
}
