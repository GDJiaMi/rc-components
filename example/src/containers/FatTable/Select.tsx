/**
 * 基本
 */
import React from 'react'
import { AdminLayout, FatTable, Title } from '@gdjiami/rc-components'
import { ColumnsType, FetchHandler } from '@gdjiami/rc-components/lib/fat-table'
import { Input, Form } from 'antd'

interface Params {
  name: string
}

interface Data {
  id: string
  name: string
  birthday: string
}

export default class Base extends React.Component {
  private columns: ColumnsType<Data, Params> = [
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '生日',
      dataIndex: 'birthday',
    },
    {
      title: '操作',
      render: (item, _, table) => {
        return (
          <FatTable.Actions>
            <FatTable.Action
              disabled={!table.canShiftUp(item.id)}
              onClick={() => table.shift(item.id, 'up')}
            >
              上移
            </FatTable.Action>
            <FatTable.Action
              disabled={!table.canShiftDown(item.id)}
              onClick={() => table.shift(item.id, 'down')}
            >
              下移
            </FatTable.Action>
            <FatTable.Action onClick={() => table.remove([item.id])}>
              删除
            </FatTable.Action>
          </FatTable.Actions>
        )
      },
    },
  ]
  public render() {
    return (
      <AdminLayout.Body>
        <Title>常用操作</Title>
        <FatTable<Data, Params>
          enableSelect
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
