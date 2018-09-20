import React from 'react'
import {
  FooterToolbar,
  AdminLayout,
  Title,
  BackBar,
  InputNumber,
  Confirm,
} from '@gdjiami/rc-components'
import { Button, Form, Input } from 'antd'

export default class FooterToolbarDemo extends React.Component {
  public render() {
    return (
      <>
        <BackBar>长表单创建</BackBar>
        <AdminLayout.Body>
          <Title>底部工具栏</Title>
          <Form layout="horizontal">
            <Form.Item label="标题">
              <Input />
            </Form.Item>
            <Form.Item label="带单位数字框+inline模式">
              <InputNumber placeholder="秒" inline /> /
              <InputNumber placeholder="元" inline />
            </Form.Item>
            <Form.Item label="文字内容">
              <Input.TextArea rows={40} />
            </Form.Item>
          </Form>
          <FooterToolbar left="left content">
            <Button>取消</Button>
            <Confirm onConfirm={this.handleSubmit} message="确认提交">
              <Button type="primary">提交</Button>
            </Confirm>
          </FooterToolbar>
        </AdminLayout.Body>
      </>
    )
  }

  private handleSubmit = async () => {
    return '提交成功'
  }
}
