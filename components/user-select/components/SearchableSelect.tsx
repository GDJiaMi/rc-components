/**
 * 可搜索下拉列表
 */
import React from 'react'
import Select, { SelectValue } from 'antd/es/select'
import Icon from 'antd/es/icon'
import Spin from 'antd/es/spin'
import debounce from 'lodash/debounce'
import { PageSize } from '../constants'

export interface SearchableSelectProps<T> {
  value?: T[]
  onChange?: (value: T[]) => void
  // 显示清除按钮
  allowClear?: boolean
  // 多选
  multiple?: boolean
  placeholder?: string
  onBlur?: () => void
  className?: string
  style?: React.CSSProperties
  selectClassName?: string
  selectStyle?: React.CSSProperties
  notFoundContent?: React.ReactNode
  // 隐藏不在option列表中的项
  hideUntrackedItems?: boolean
  formatter: (value: T) => string
  optionFilterProp?: 'children'
  onFetch: (
    query: string,
    page: number,
    pageSize: number,
  ) => Promise<{ total: number; items: T[] }>
}

interface Props<T> extends SearchableSelectProps<T> {}
interface State<T> {
  // 全部数据就绪，启动本地搜索模式
  loading?: boolean
  error?: Error
  list?: T[]
  query: string
  value?: string[]
}

export default class SearchableSelect<
  T extends { id: string }
> extends React.PureComponent<Props<T>, State<T>> {
  public state: State<T> = {
    loading: false,
    query: '',
    list: this.props.value ? this.props.value : [],
  }

  // TODO: 性能优化
  public static getDerivedStateFromProps<T extends { id: string }>(
    props: Props<T>,
    state: State<T>,
  ) {
    const { value, hideUntrackedItems } = props
    const { list } = state
    if (value == null || value.length === 0) {
      return { value: undefined }
    }

    if (hideUntrackedItems) {
      if (list) {
        return {
          value: value
            .filter(({ id }) => list.findIndex(i => i.id === id) !== -1)
            .map(i => i.id),
        }
      }
    }

    return { value: value.map(i => i.id) }
  }

  public componentDidMount() {
    this.fetchList()
  }

  public render() {
    const {
      allowClear,
      multiple,
      placeholder,
      style,
      className,
      selectClassName,
      selectStyle,
      notFoundContent,
      optionFilterProp,
    } = this.props
    const { loading, list, error, value } = this.state
    return (
      <div className={`jm-user-search ${className || ''}`} style={style}>
        <Select
          showSearch
          className={selectClassName}
          style={selectStyle}
          value={value}
          mode={multiple ? 'multiple' : undefined}
          placeholder={placeholder}
          filterOption={false}
          optionFilterProp={optionFilterProp}
          allowClear={allowClear}
          notFoundContent={
            loading ? (
              <Spin size="small" />
            ) : error ? (
              <div className="jm-user-search__error">
                <Icon type="close-circle" />
                {error.message}
              </div>
            ) : (
              notFoundContent
            )
          }
          onBlur={this.handleBlur}
          onChange={this.handleChange}
          onSearch={this.handleSearch}
        >
          {!!list && list.map(this.renderItem)}
          {(list == null || list.length === 0) &&
            !this.state.query &&
            !!this.props.value &&
            this.props.value.map(this.renderItem)}
        </Select>
        {!!loading && <Icon type="loading" />}
      </div>
    )
  }

  private renderItem = (i: T) => {
    const { formatter } = this.props
    return (
      <Select.Option key={i.id} value={i.id} data-value={i}>
        {formatter(i)}
      </Select.Option>
    )
  }

  private handleBlur = () => {
    this.setState({ query: '', error: undefined }, () => {
      this.fetchList()
    })
    if (this.props.onBlur) {
      this.props.onBlur()
    }
  }

  private handleSearch = debounce((query: string) => {
    this.setState({ query }, () => {
      this.fetchList()
    })
  }, 500)

  private handleChange = (
    value: SelectValue,
    option: React.ReactElement<any> | React.ReactElement<any>[],
  ) => {
    if (this.props.onChange) {
      const newValue =
        value == null
          ? []
          : Array.isArray(option)
          ? option.map(op => op.props['data-value'] as T)
          : [option.props['data-value'] as T]
      this.props.onChange(newValue)
    }
  }

  private fetchList = async () => {
    if (this.state.loading) {
      return
    }
    try {
      this.setState({ loading: true, error: undefined })
      const res = await this.props.onFetch(this.state.query, 1, PageSize)
      this.setState({
        list: res.items,
      })
    } catch (error) {
      this.setState({ error, list: [] })
    } finally {
      this.setState({ loading: false })
    }
  }
}
