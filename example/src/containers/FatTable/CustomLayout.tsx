/**
 * 自定义布局
 */
import React from 'react'
import { AdminLayout, FatTable, Title } from '@gdjiami/rc-components'
import { Form, DatePicker, Input } from 'antd'
import moment, { Moment } from 'moment'
import {
  ColumnsType,
  FetchHandler,
  HeaderRenderer,
  InitHandler,
  PersistHandler,
} from '@gdjiami/rc-components/lib/fat-table'

const FORMAT = 'YYYY-MM-DD'

interface Params {
  range: [Moment, Moment]
  name: string
}

interface Order {
  id: string
  name: string
  createdDate: number
}

export default class CustomLayout extends React.Component {
  private columns: ColumnsType<Order, Params> = [
    { dataIndex: 'name', title: '名称' },
    {
      title: '创建时间',
      dataIndex: 'createdDate',
    },
  ]
  public render() {
    return (
      <>
        <Title>自定义布局</Title>
        <FatTable<Order, Params>
          columns={this.columns}
          onInit={this.initialDefaultValue}
          onFetch={this.handleFetch}
          onPersist={this.handlerPersist}
          header={this.renderHeader}
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
      </>
    )
  }

  private initialDefaultValue: InitHandler<Order, Params> = query => ({
    range: [
      query.getDate('startTime', FORMAT, moment().startOf('month')),
      query.getDate('endTime', FORMAT, moment().endOf('month')),
    ],
    name: query.getStr('name'),
  })

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
        createdDate: Date.now(),
      })
    }
    return {
      list,
      total: 150,
    }
  }
}
