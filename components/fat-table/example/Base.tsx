/**
 * 基本
 */
import React from 'react'
import FatTable, { ColumnsType, FetchHandler } from '../index'
import Input from 'antd/lib/input'
import Form from 'antd/lib/form'
import AdminLayout from '../../admin-layout'
import '../style/css'

interface Params {
  name: string
}

interface Data {
  id: string
  name: string
  birthday: string
}

export default class Base extends React.Component {
  private columns: ColumnsType<Data> = [
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '生日',
      dataIndex: 'birthday',
    },
  ]
  public render() {
    return (
      <AdminLayout.Body>
        <FatTable<Data, Params>
          columns={this.columns}
          onFetch={this.handleFetch}
          // 确认默认值
          onInit={query => ({ name: query.getStr('name', '') })}
          header={(form, defaultValue) => (
            <>
              <Form.Item>
                {form.getFieldDecorator('name', {
                  initialValue: defaultValue.name,
                })(<Input placeholder="名称" />)}
              </Form.Item>
            </>
          )}
          headerExtra={<Form.Item>header extra here</Form.Item>}
        />
      </AdminLayout.Body>
    )
  }

  private handleFetch: FetchHandler<Data, Params> = async params => {
    console.log('fetching...', { ...params })
    const { pageSize, current } = params
    const list: Data[] = []
    for (let i = 0; i < pageSize; i++) {
      list.push({
        id: `${current + i}`,
        name: `${current + i}${params.name}`,
        birthday: `1995-12-12 12:12:${i}`,
      })
    }
    return {
      list,
      total: pageSize * 7,
    }
  }
}
