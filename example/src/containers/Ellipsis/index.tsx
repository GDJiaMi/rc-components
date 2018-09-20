import React from 'react'
import { Ellipsis, AdminLayout } from '@gdjiami/rc-components'
import { Card } from 'antd'

export default class EllipsisDemo extends React.Component {
  public render() {
    return (
      <AdminLayout.Body>
        <Card title="多行省略" style={{ width: '200px' }}>
          <Ellipsis lines={5} tooltip>
            首先，作者表明，专利法经常被人误解，因为其实充满了各种晦涩难懂的法律术语，所以，作者用个例子来讲述专利的一个原则
            ——
            专利并不是授于让你制造或开发的权利，而是授予你可以排他的权利。（事实上似乎也是这样，申请专利很多时候都不是为了制作相关的产品，而是为了防止别人使用类似的技术制作相关的产品）
          </Ellipsis>
        </Card>
      </AdminLayout.Body>
    )
  }
}
