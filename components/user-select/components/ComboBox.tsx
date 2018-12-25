import React from 'react'
import AutoComplete from 'antd/es/auto-complete'
import Input, { InputProps } from 'antd/es/input'
import Icon from 'antd/es/icon'
import debounce from 'lodash/debounce'
import { PageSize } from '../constants'
import { SelectValue } from 'antd/es/select'

export interface ComboBoxProps<T> {
  value?: T | string
  onChange?: (value: T | string) => void
  defaultPageSize?: number
  ignoreEmpty?: boolean
  formatter: (value: T) => string
  onFetch?: (
    query: string,
    page: number,
    pageSize: number,
  ) => Promise<{ total: number; items: T[] }>
  className?: string
  style?: React.CSSProperties
  allowClear?: boolean
  placeholder?: string
  inputProps?: InputProps
  onFocus?: () => void
  onBlur?: () => void
}

interface State<T> {
  loading: boolean
  error?: Error
  list?: T[]
}

const Option = AutoComplete.Option

/**
 * Combo box 模式选择器
 */
export default class ComboBox<T extends { id: string }> extends React.Component<
  ComboBoxProps<T>
> {
  public state: State<T> = {
    loading: false,
  }

  public render() {
    const {
      className,
      style,
      formatter,
      inputProps = {},
      allowClear,
      placeholder,
      onFocus,
      value,
    } = this.props
    const { list, loading, error } = this.state

    const content = (
      // @ts-ignore
      <AutoComplete
        value={value && (typeof value === 'string' ? value : formatter(value))}
        allowClear={allowClear}
        onChange={this.handleChange}
        // @ts-ignore
        onFocus={onFocus}
        onBlur={this.handleBlur}
        dataSource={[
          ...(list
            ? list.map(i => (
                <Option key={i.id} value={i.id} data-value={i}>
                  {formatter(i)}
                </Option>
              ))
            : []),
          ...(error ? (
            <Option key="__error__" disabled>
              <div className="jm-user-search__error">
                <Icon type="close-circle" />
                {error.message}
              </div>
            </Option>
          ) : (
            []
          )),
        ]}
      >
        <Input {...inputProps} placeholder={placeholder} />
      </AutoComplete>
    )

    return (
      <div
        className={`jm-user-search jm-user-combobox ${className || ''}`}
        style={style}
      >
        {content}
        {!!loading && <Icon type="loading" />}
      </div>
    )
  }

  private handleBlur = () => {
    if (this.props.onBlur) {
      this.props.onBlur
    }
    this.setState({ list: undefined })
  }

  private handleChange = (evt: SelectValue) => {
    const value = evt as string
    if (this.props.onChange == null) {
      return
    }

    if (this.state.list) {
      const index = this.state.list.findIndex(i => i.id === value)
      if (index !== -1) {
        // 选中
        this.props.onChange(this.state.list[index])
        return
      }
    }

    this.handleSearch(value)
    this.props.onChange(value)
  }

  private handleSearch = debounce((query: string) => {
    this.search(query)
  }, 500)

  private search = (query: string = '') => {
    if (this.props.ignoreEmpty && query.trim() === '') {
      return
    }

    this.fetchList(query)
  }

  private fetchList = async (query: string) => {
    if (this.state.loading || this.props.onFetch == null) {
      return
    }

    try {
      this.setState({ loading: true, error: undefined })
      const res = await this.props.onFetch(
        query,
        1,
        this.props.defaultPageSize || PageSize,
      )
      this.setState({
        list: res.items,
      })
    } catch (error) {
      this.setState({ error, list: undefined })
    } finally {
      this.setState({ loading: false })
    }
  }
}
