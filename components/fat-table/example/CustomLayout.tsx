/**
 * 自定义布局
 */
import React from 'react'
import AdminLayout from '../../admin-layout'
import Form from 'antd/es/form'
import DatePicker from 'antd/es/date-picker'
import Input from 'antd/es/input'
import 'antd/es/date-picker/style/css'
import FatTable, { ColumnsType, FetchHandler, HeaderRenderer } from '../index'
import moment, { Moment } from 'moment'
import { InitHandler, PersistHandler, SaveHandler } from '../type'

const FORMAT = 'YYYY-MM-DD'

interface Params {
  range: [Moment, Moment]
  name: string
}

interface Order {
  id: string
  name: string
  createdDate: number
  note: string
}

export default class CustomLayout extends React.Component {
  private columns: ColumnsType<Order, Params> = [
    { dataIndex: 'name', title: '名称' },
    {
      title: '创建时间',
      dataIndex: 'createdDate',
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
  public render() {
    return (
      <FatTable<Order, Params>
        columns={this.columns}
        onInit={this.initialDefaultValue}
        onFetch={this.handleFetch}
        onPersist={this.handlerPersist}
        header={this.renderHeader}
        onSave={this.handleSave}
      >
        {(form, defaultValues, slots, instance) => (
          <>
            <AdminLayout.HeaderBar>
              <Form layout="inline">
                <Form.Item label="创建日期">
                  {form.getFieldDecorator('range', {
                    initialValue: defaultValues.range,
                  })(
                    <DatePicker.RangePicker
                      onChange={() => instance.fetch(true, true)}
                    />,
                  )}
                </Form.Item>
              </Form>
            </AdminLayout.HeaderBar>
            <AdminLayout.Body>
              {slots.header()}
              {slots.body()}
            </AdminLayout.Body>
          </>
        )}
      </FatTable>
    )
  }

  private initialDefaultValue: InitHandler<Order, Params> = query => ({
    range: [
      query.getDate('startTime', FORMAT, moment().startOf('month')),
      query.getDate('endTime', FORMAT, moment().endOf('month')),
    ],
    name: query.getStr('name'),
  })

  private handleSave: SaveHandler<Order, Params> = async value => {
    alert(value.note)
    if (value.note === 'error') {
      throw new Error('保存错误')
    }
  }

  private handlerPersist: PersistHandler<Order, Params> = ({
    range,
    ...other
  }) => ({
    startTime: range[0].format(FORMAT),
    endTime: range[1].format(FORMAT),
    ...other,
  })

  private renderHeader: HeaderRenderer<Order, Params> = (
    form,
    defaultValue,
  ) => (
    <Form.Item>
      {form.getFieldDecorator('name', {
        initialValue: defaultValue.name,
      })(<Input placeholder="名称" />)}
    </Form.Item>
  )

  private handleFetch: FetchHandler<Order, Params> = async params => {
    console.log('fetching', { ...params })
    const list: Order[] = []
    for (let i = 0; i < params.pageSize; i++) {
      list.push({
        id: `${params.current}+${i}`,
        name: `${params.current}+${i}+${params.name}`,
        note: '',
        createdDate: Date.now(),
      })
    }
    return {
      list,
      total: 150,
    }
  }
}
