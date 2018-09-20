/**
 * run: yarn parcel -- ./components/AdminLayout/example/index.html
 */
import React from 'react'
import { FatModal, AdminLayout } from '@gdjiami/rc-components'
import { IFatModal } from '@gdjiami/rc-components/lib/fat-modal'
import { Form, Input } from 'antd'

interface UserInfo {
  id?: string
  name: string
  mobile: string
}

export default class FatModalDemo extends React.Component {
  private modal = React.createRef<IFatModal<UserInfo>>()
  public render() {
    return (
      <AdminLayout.Body>
        <FatModal<UserInfo>
          onSubmit={this.handleSubmit}
          wrappedComponentRef={this.modal}
          title="新建用户"
        >
          {({ getFieldDecorator }, values) => (
            <Form layout="horizontal">
              <Form.Item label="名称">
                {getFieldDecorator('name', {
                  initialValue: values.name,
                  rules: [{ required: true }],
                })(<Input placeholder="名称" />)}
              </Form.Item>
              <Form.Item label="手机">
                {getFieldDecorator('mobile', {
                  initialValue: values.mobile,
                  rules: [{ required: true }],
                })(<Input placeholder="手机" />)}
              </Form.Item>
            </Form>
          )}
        </FatModal>
        <div>
          <a onClick={this.handleCreate}>新建</a>
        </div>
        <div>
          <a onClick={this.handleEdit}>编辑</a>
        </div>
      </AdminLayout.Body>
    )
  }

  private handleCreate = () => {
    this.modal.current!.show()
  }

  private handleEdit = () => {
    const currentUser = {
      id: '1',
      name: 'Test',
      mobile: '13482332332',
    }
    this.modal.current!.show({ defaultValue: currentUser, title: '编辑用户' })
  }

  private handleSubmit = async (
    value: UserInfo,
    defaultValue: Partial<UserInfo>,
  ) => {
    if (defaultValue.id) {
      // 编辑模式
      throw new Error('保存失败')
    } else {
      // 新建模式
      // 进行异步保存操作
      return '保存成功'
    }
  }
}
