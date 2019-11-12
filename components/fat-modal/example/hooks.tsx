/**
 * run: yarn parcel -- ./components/AdminLayout/example/index.html
 */
import React, { FC } from 'react'
import ReactDOM from 'react-dom'
import FatModal from '../index'
import useFatModal from '../useFatModal'
import '../style/css'
import Form from 'antd/es/form'
import Input from 'antd/es/input'
import 'antd/es/input/style/css'

interface UserInfo {
  id?: string
  name: string
  mobile: string
}

const handleSubmit = async (
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

const App: FC = () => {
  const modal = useFatModal<UserInfo>({
    onSubmit: handleSubmit,
    title: '新建用户',
    children: ({ getFieldDecorator: f }, values) => (
      <Form layout="horizontal">
        <Form.Item>
          {f('name', {
            initialValue: values.name,
            rules: [{ required: true }],
          })(<Input placeholder="名称" />)}
        </Form.Item>
        <Form.Item>
          {f('mobile', {
            initialValue: values.mobile,
            rules: [{ required: true }],
          })(<Input placeholder="手机" />)}
        </Form.Item>
      </Form>
    ),
  })

  const handleCreate = () => {
    modal.show()
  }

  const handleEdit = () => {
    const currentUser = {
      id: '1',
      name: 'Test',
      mobile: '13482332332',
    }
    modal.show({ defaultValue: currentUser, title: '编辑用户' })
  }

  return (
    <div>
      <FatModal {...modal.props} />
      <a onClick={handleCreate}>新建</a>
      <a onClick={handleEdit}>编辑</a>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
