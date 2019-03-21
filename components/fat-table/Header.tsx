import Form from 'antd/es/form'
import Button from 'antd/es/button'
import React, { Component } from 'react'
import {
  FormProps,
  HeaderExtraRenderer,
  HeaderRenderer,
  IFatTable,
} from './type'

interface HeaderProps<T, P> {
  header?: HeaderRenderer<T, P>
  headerExtra?: HeaderExtraRenderer<T, P>
  searchText?: string
  form: FormProps
  loading?: boolean
  defaultValues: Partial<P>
  table: IFatTable<T, P>
}

export default class Header<T, P> extends Component<HeaderProps<T, P>> {
  public render() {
    const {
      header,
      headerExtra,
      searchText,
      form,
      loading,
      defaultValues,
      table,
    } = this.props

    if (header != null) {
      return (
        <Form
          className="jm-search-form"
          layout="inline"
          onSubmit={table.submit}
        >
          {header(form, defaultValues, table)}
          <Form.Item>
            <Button loading={loading} type="primary" htmlType="submit">
              {searchText}
            </Button>
          </Form.Item>
          {!!headerExtra && typeof headerExtra === 'function'
            ? headerExtra(form, defaultValues, table)
            : headerExtra}
        </Form>
      )
    }
    return null
  }
}
