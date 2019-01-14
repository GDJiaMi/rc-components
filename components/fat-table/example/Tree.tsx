/**
 * 树形结构
 */
import React from 'react'
import FatTable, { ColumnsType, FetchHandler, IFatTable } from '../index'
import Input from 'antd/es/input'
import Form from 'antd/es/form'
import AdminLayout from '../../admin-layout'
import '../style/css'
import { FetchChildrenHandler } from '../type'

interface Params {
  name: string
}

interface Data {
  id: string
  name: string
  birthday: string
  note: string
  children?: Data[]
}

export default class Base extends React.Component {
  private table = React.createRef<IFatTable<Data, Params>>()
  private columns: ColumnsType<Data, Params> = [
    {
      title: '名称',
      dataIndex: 'name',
      render: r => {
        return <span dangerouslySetInnerHTML={{ __html: r.name }} />
      },
    },
    {
      title: '生日',
      dataIndex: 'birthday',
    },
    {
      title: '不存在',
      dataIndex: 'unknow',
      showHrWhenEmpty: true,
    },
    {
      title: '备注',
      dataIndex: 'note',
      render: (r, _, t, editing) => {
        return editing ? (
          <Input
            value={r.note}
            onChange={evt => t.setSnapshot({ note: evt.target.value })}
          />
        ) : (
          <span>{r.note}</span>
        )
      },
    },
    {
      title: '操作',
      render: (r, _, t, editing) => {
        return (
          <FatTable.Actions>
            {editing ? (
              <>
                <FatTable.Action onClick={t.save}>保存</FatTable.Action>
                <FatTable.Action onClick={t.cancelEdit}>取消</FatTable.Action>
              </>
            ) : (
              <FatTable.Action onClick={() => t.setEditing(r)}>
                编辑
              </FatTable.Action>
            )}
          </FatTable.Actions>
        )
      },
    },
  ]
  public state = {
    filterValue: '',
  }
  public render() {
    return (
      <AdminLayout.Body>
        <FatTable<Data, Params>
          columns={this.columns}
          onFetch={this.handleFetch}
          lazyMode
          onFetchChildren={this.handleFetchChildren}
          filterKey="name"
          filterValue={this.state.filterValue}
          // 确认默认值
          onInit={query => ({ name: query.getStr('name', '') })}
          onSubmit={p => {
            this.setState({ filterValue: p.name })
            return false
          }}
          header={(form, defaultValue) => (
            <>
              <Form.Item>
                {form.getFieldDecorator('name', {
                  initialValue: defaultValue.name,
                })(<Input placeholder="名称" />)}
              </Form.Item>
            </>
          )}
          onSave={async () => {}}
          headerExtra={<Form.Item>header extra here</Form.Item>}
          defaultExpandedLevel={1}
          wrappedComponentRef={this.table}
        />
      </AdminLayout.Body>
    )
  }

  private handleFetchChildren: FetchChildrenHandler<Data, Params> = async (
    id,
    record,
  ) => {
    const list: Data[] = []
    for (let i = 0; i < 3; i++) {
      list.push({
        id: `${record.id + i}`,
        name: `${record.id + i}AbCdEfG${Math.random()}`,
        birthday: `1995-12-12 12:12:${i}`,
        note: '',
        children: [],
      })
    }

    return list
  }

  private handleFetch: FetchHandler<Data, Params> = async params => {
    console.log('fetching...', { ...params })
    const { pageSize, current } = params
    const list: Data[] = []

    for (let i = 0; i < 3; i++) {
      list.push({
        id: `${current + i}`,
        name: `${current + i}AbCdEfG${Math.random()}`,
        birthday: `1995-12-12 12:12:${i}`,
        note: '',
        children: [],
      })
    }
    return {
      list,
      total: pageSize * 7,
    }
  }
}
