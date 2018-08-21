import React from 'react'
import Form, { FormComponentProps } from 'antd/lib/form'
import Button from 'antd/lib/button'
import Table from 'antd/lib/table'
import Alert from 'antd/lib/alert'
import { PaginationProps } from 'antd/lib/pagination'
import { DefaultPagination } from './constants'
import { QueryComponentProps, QueryGetter } from '../query'
import { FatTableProps, FatTableRenderer } from './type'

interface Props<T, P extends object>
  extends FatTableProps<T, P>,
    FormComponentProps,
    QueryComponentProps {}

interface State<T> {
  // 前端分页模式, 所有数据都加载完毕
  allReady?: boolean
  // 正在加载
  loading?: boolean
  // 加载失败
  error?: Error
  selected: {
    keys: any[]
    rows: T[]
  }
  pagination: PaginationProps
  dataSource: T[]
}

export default class FatTableInner<T, P extends object> extends React.Component<
  Props<T, P>,
  State<T>
> {
  public static defaultProps = {
    searchText: '搜索',
    idKey: 'id',
    namespace: '',
    offsetMode: true,
    fetchOnMount: true,
    defaultPagination: DefaultPagination,
    enablePersist: true,
    confirmOnRemove: false,
  }

  public state: State<T> = {
    dataSource: [],
    selected: {
      keys: [],
      rows: [],
    },
    pagination: {
      ...(this.props.defaultPagination || {}),
      // 分页大小变化
      onShowSizeChange: this.handleShowSizeChange.bind(this),
      onChange: this.handlePageChange.bind(this),
    },
  }

  private query: QueryGetter
  private defaultValues: Partial<P> = {}

  public componentWillMount() {
    this.initialState()
  }

  public componentDidMount() {
    // 初始化加载列表
    if (this.props.fetchOnMount && this.props.onChange == null) {
      this.search(false, false)
    }
  }

  public render() {
    const renderer: FatTableRenderer<T, P> =
      this.props.children || this.defaultRenderer

    return renderer(
      this.props.form,
      this.defaultValues,
      {
        header: this.renderHeader,
        body: this.renderBody,
      },
      this,
    )
  }

  public submit = (evt: React.FormEvent<void>) => {
    evt.preventDefault()
    this.search(true)
  }

  private defaultRenderer = () => {
    const { className, style } = this.props
    return (
      <div className={className} style={style}>
        {this.renderHeader()}
        {this.renderBody()}
      </div>
    )
  }

  private renderHeader = () => {
    const { header, headerExtra, searchText, form } = this.props
    const { loading } = this.state
    const { defaultValues } = this
    if (header != null) {
      return (
        <Form className="jm-search-form" layout="inline" onSubmit={this.submit}>
          {header(form, defaultValues)}
          <Form.Item>
            <Button loading={loading} type="primary" htmlType="submit">
              {searchText}
            </Button>
          </Form.Item>
          {headerExtra}
        </Form>
      )
    }
    return null
  }

  /**
   * 表格渲染
   * TODO: 支持传入props
   */
  private renderBody = () => {
    const {
      columns,
      idKey,
      enablePagination,
      enableSelect,
      footer,
      size,
      borderred,
    } = this.props
    const { pagination, loading, selected, error } = this.state
    const { dataSource } = this.state
    const rowSelection = enableSelect
      ? {
          selectedRowKeys: selected.keys,
          onChange: this.handleSelectChange,
        }
      : undefined

    return (
      <>
        {!!error && (
          <Alert
            banner
            message={
              <span>
                数据加载失败({error.message}), <a onClick={this.retry}>重试</a>
              </span>
            }
          />
        )}
        <Table
          size={size}
          bordered={borderred}
          columns={columns}
          rowKey={idKey}
          loading={loading}
          pagination={enablePagination ? pagination : undefined}
          rowSelection={rowSelection}
          dataSource={dataSource}
          footer={footer}
        />
      </>
    )
  }

  /**
   * 初始化状态
   */
  private initialState() {
    const {
      namespace,
      defaultValues,
      defaultPagination,
      enablePersist,
      onChange,
      search,
    } = this.props

    // 可控模式
    if (onChange != null) {
      this.setState({ allReady: true })
    }

    const query = (this.query = search.get(namespace))
    if (enablePersist) {
      // 初始化分页信息
      this.setState({
        pagination: {
          ...this.state.pagination,
          pageSize: query.getInt(
            'pageSize',
            (defaultPagination && defaultPagination.pageSize) || 15,
          ),
          current: query.getInt(
            'current',
            (defaultPagination && defaultPagination.current) || 1,
          ),
        },
      })
    }
    // 初始化表单默认值
    if (defaultValues) {
      this.defaultValues =
        (typeof defaultValues === 'function'
          ? defaultValues(query)
          : defaultValues) || {}
    }
  }

  private retry = () => {
    this.search(false, false)
  }

  /**
   * 处理表格选择变化
   * FIXME: rows 可能不等于keys
   */
  private handleSelectChange = (keys: any[], rows: Object[]) => {
    this.setState({
      selected: {
        keys,
        rows: rows as T[],
      },
    })
  }

  /**
   *  分页大小变化
   */
  private handleShowSizeChange(page: number, pageSize: number) {
    this.setState({
      pagination: {
        ...this.state.pagination,
        current: 1,
        pageSize,
      },
    })
    if (!this.state.allReady) {
      this.search(false, false)
    } else {
      const { namespace, enablePersist, search } = this.props
      if (enablePersist) {
        search.set(namespace as string, { current: page, pageSize })
      }
    }
  }

  /**
   * 页面变化
   */
  private handlePageChange(page: number) {
    this.setState({
      pagination: {
        ...this.state.pagination,
        current: page,
      },
    })
    if (!this.state.allReady) {
      this.search(false, false)
    } else {
      const { namespace, enablePersist, search } = this.props
      if (enablePersist) {
        search.set(namespace as string, { current: page })
      }
    }
  }

  /**
   * 搜索
   * @param validate 开启验证
   * @param resetPage TODO
   */
  private search = (validate: boolean = false, resetPage: boolean = true) => {}
}
