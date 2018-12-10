/**
 * run: yarn parcel -- ./components/AdminLayout/example/index.html
 */
import React from 'react'
import ReactDOM from 'react-dom'
import FatModal, { FatModalInner } from '../index'
import '../style/css'
import Form from 'antd/es/form'
import Input from 'antd/es/input'
import 'antd/es/input/style/css'

interface UserInfo {
  id?: string
  name: string
  mobile: string
}

class App extends React.Component {
  private modal = React.createRef<FatModalInner<UserInfo>>()
  public render() {
    return (
      <div>
        <FatModal<UserInfo>
          onSubmit={this.handleSubmit}
          wrappedComponentRef={this.modal}
          title="新建用户"
        >
          {({ getFieldDecorator }, values) => (
            <Form layout="horizontal">
              <Form.Item>
                {getFieldDecorator('name', {
                  initialValue: values.name,
                  rules: [{ required: true }],
                })(<Input placeholder="名称" />)}
              </Form.Item>
              <Form.Item>
                {getFieldDecorator('mobile', {
                  initialValue: values.mobile,
                  rules: [{ required: true }],
                })(<Input placeholder="手机" />)}
              </Form.Item>
            </Form>
          )}
        </FatModal>
        <a onClick={this.handleCreate}>新建</a>
        <a onClick={this.handleEdit}>编辑</a>
      </div>
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

ReactDOM.render(<App />, document.getElementById('root'))
