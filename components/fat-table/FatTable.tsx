/**
 * TODO: 支持批量上移下移
 * TODO: 增强column的功能，支持nowrap，排序等功能
 * TODO: 处理Table onChange 事件，完善排序，过滤状态的处理
 * TODO: 性能优化
 * TODO: 受控模式支持分页等请求
 */
import React from 'react'
import Form, { FormComponentProps } from 'antd/lib/form'
import Button from 'antd/lib/button'
import Table, { ColumnProps } from 'antd/lib/table'
import Alert from 'antd/lib/alert'
import Modal from 'antd/lib/modal'
import { PaginationProps } from 'antd/lib/pagination'
import message from 'antd/lib/message'
import { DefaultPagination } from './constants'
import { getExpandKeyByLevel, filterDataSource } from './utils'
import { QueryComponentProps } from '../query'
import {
  FatTableProps,
  FatTableRenderer,
  IFatTable,
  PaginationInfo,
} from './type'

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
  // 经过过滤的数据源
  filteredDataSource?: T[]
  // 受控展开状态
  expandedKeys?: string[]
}

export default class FatTableInner<T, P extends object>
  extends React.Component<Props<T, P>, State<T>>
  implements IFatTable<T, P> {
  public static defaultProps = {
    searchText: '搜索',
    idKey: 'id',
    namespace: '',
    offsetMode: true,
    fetchOnMount: true,
    enablePagination: true,
    defaultPagination: DefaultPagination,
    enablePersist: true,
    confirmOnRemove: true,
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
    expandedKeys: [],
  }

  // 默认展开
  private defaultExpandedKeys?: string[]
  private defaultValues: Partial<P> = {}

  public static getDerivedStateFromProps<T, P extends object>(
    props: Props<T, P>,
    state: State<T>,
  ) {
    if (props.onChange && props.value && props.value !== state.dataSource) {
      // 同步value 和 dataSource
      return {
        dataSource: props.value,
        pagination: {
          ...state.pagination,
          total: props.value ? props.value.length : 0,
        },
      }
    }
    return null
  }

  public constructor(props: Props<T, P>) {
    super(props)
    this.initialState()
  }

  public componentDidMount() {
    if (this.state.dataSource) {
      this.defaultExpandedKeys = this.genDefaultExpandedKeys(
        this.state.dataSource,
      )
      this.updateFilterStatus()
    }

    // 初始化加载列表
    if (this.props.fetchOnMount && this.props.onChange == null) {
      this.search(false, false)
    }
  }

  public componentDidUpdate(prevProps: Props<T, P>, prevState: State<T>) {
    if (this.state.dataSource !== prevState.dataSource) {
      this.defaultExpandedKeys = this.genDefaultExpandedKeys(
        this.state.dataSource,
      )
    }

    if (
      this.state.dataSource !== prevState.dataSource ||
      prevProps.filterKey !== this.props.filterKey ||
      prevProps.filterValue !== this.props.filterValue
    ) {
      this.updateFilterStatus()
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

  /**
   * 处理表单提交
   */
  public submit = (evt: React.FormEvent<void>) => {
    evt.preventDefault()
    this.search(true, undefined, undefined, true)
  }

  /**
   * 命令式触发请求
   */
  public fetch = (
    validate: boolean = true,
    resetPage: boolean = true,
    extraParams?: Partial<P>,
  ) => {
    this.search(validate, resetPage, extraParams)
  }

  /**
   * 获取已选中
   */
  public getSelected = (): T[] => {
    return this.state.selected.rows || []
  }

  /**
   * 获取已选中的id
   */
  public getSelectedIds = (): any[] => {
    return this.state.selected.keys || []
  }

  /**
   * 清除已选中
   */
  public clearSelected = () => {
    this.setState({
      selected: {
        keys: [],
        rows: [],
      },
    })
  }

  /**
   * 获取当前dataSource
   */
  public getList = () => {
    return this.state.dataSource
  }

  /**
   * 设置当前的dataSource
   */
  public setList = (list: T[]) => {
    this.setDataSource(list)
  }

  public getDefaultValues() {
    return this.defaultValues || {}
  }

  /**
   * 重置所有数据并重新获取
   */
  public clearForm = () => {
    const { defaultPagination, namespace, search } = this.props
    // 初始化表单默认值
    this.props.form.resetFields()
    this.clearSelected()
    this.setState(
      {
        pagination: {
          ...this.state.pagination,
          current: (defaultPagination && defaultPagination.current) || 1,
          pageSize: (defaultPagination && defaultPagination.pageSize) || 15,
          total: 0,
        },
      },
      () => {
        this.setDataSource([])
        search.clear(namespace)
      },
    )
  }

  public removeSelected() {
    const ids = this.getSelectedIds()
    if (ids.length) {
      this.remove(ids)
    }
  }

  public handleRemoveSelected = () => {
    this.removeSelected()
  }

  /**
   * 移除元素
   */
  public remove(ids: any[]) {
    if (ids.length === 0) {
      return
    }

    if (this.props.confirmOnRemove) {
      Modal.confirm({
        title: '提示',
        content: this.props.removeConfirmText || '确认删除?',
        onOk: () => this.handleRemove(ids),
        okText: '确认',
        cancelText: '取消',
      })
    } else {
      this.handleRemove(ids)
    }
  }

  /**
   * 根据id获取字段在全局的索引
   * @returns [number, number] 全局索引，当前页面索引
   */
  public getIndexById(id: any): [number, number] {
    const { idKey } = this.props
    const {
      dataSource,
      allReady,
      pagination: { pageSize = 15, current = 1 },
    } = this.state
    const indexInCurrentPage = dataSource.findIndex(
      i => i[idKey as string] === id,
    )
    if (allReady || indexInCurrentPage === -1) {
      return [indexInCurrentPage, indexInCurrentPage]
    }
    return [(current - 1) * pageSize + indexInCurrentPage, indexInCurrentPage]
  }

  /**
   * 是否可以上移
   */
  public canShiftUp(id: any) {
    const [index] = this.getIndexById(id)
    return index !== 0
  }

  /**
   * 是否可以下移
   */
  public canShiftDown(id: any) {
    const [index] = this.getIndexById(id)
    const {
      pagination: { total = 0 },
    } = this.state
    return index < total - 1
  }

  public shiftUp(id: any) {
    return this.shift(id, 'up')
  }

  public shiftDown(id: any) {
    this.shift(id, 'down')
  }

  /**
   * 移动元素
   */
  public shift(id: any, dir: 'up' | 'down' = 'up') {
    const {
      allReady,
      pagination: { total = 0 },
    } = this.state
    const [index, indexInCurrentPage] = this.getIndexById(id)

    if (index === -1 || (dir === 'up' ? index === 0 : index === total - 1)) {
      return
    }

    const dataSource = [...this.state.dataSource]
    const shiftInPlace =
      allReady ||
      (dir === 'up'
        ? indexInCurrentPage > 0
        : indexInCurrentPage < dataSource.length - 1) // 非跨页

    // shift inplace
    if (shiftInPlace) {
      const toIndex =
        dir === 'up' ? indexInCurrentPage - 1 : indexInCurrentPage + 1
      const to = dataSource[toIndex]
      const current = dataSource[indexInCurrentPage]
      dataSource[toIndex] = current
      dataSource[indexInCurrentPage] = to
      // persist if need
      this.handleShift(current, to, dir, () => {
        // 触发更新
        this.setDataSource(dataSource)
      })
    } else {
      // shift remote
      this.handleShift(dataSource[indexInCurrentPage], null, dir, () => {
        // 重新加载数据
        // TODO: 可能要跟随
        this.search(false, false)
      })
    }
  }

  /**
   * 批量更新
   */
  public updateItems(updator: (list: T[]) => T[]): void {
    const items = updator([...this.state.dataSource]) || []
    if (items.length === 0) {
      return
    }
    const idKey = this.props.idKey as string
    const dataSource = [...this.state.dataSource]
    for (const item of items) {
      const index = dataSource.findIndex(i => i[idKey] === item[idKey])
      if (index !== -1) {
        dataSource.splice(index, 1, item)
      }
    }
    this.setDataSource(dataSource)
  }

  /**
   * 更新单个元素
   */
  public updateItem = (item: T) => {
    const dataSource = [...this.state.dataSource]
    const { idKey } = this.props
    const index = dataSource.findIndex(
      i => i[idKey as string] === item[idKey as string],
    )

    if (index !== -1) {
      dataSource.splice(index, 1, item)
      this.setDataSource(dataSource)
    }
  }

  /**
   * 滚动到第一页
   */
  public scrollToFirstPage() {
    this.setState({
      pagination: {
        ...this.state.pagination,
        current: 1,
      },
    })
  }

  /**
   * 滚动到最后一页
   */
  public scrollToLastPage() {
    const { total = 0, pageSize = 15, current } = this.state.pagination
    const lastPage = Math.ceil(total / pageSize) || 1

    if (current === lastPage) {
      return
    }

    this.setState({
      pagination: {
        ...this.state.pagination,
        current: lastPage,
      },
    })
  }

  /**
   * 删除后同步列表状态
   */
  private syncAfterRemove(ids: any[]) {
    const idKey = this.props.idKey as string
    const pageSize = this.state.pagination.pageSize || 15
    const dataSource = [...this.state.dataSource]
    const currentPageLength = dataSource.length
    const total = this.state.pagination.total || currentPageLength
    const onlyOnePage = total <= pageSize && total === currentPageLength
    // 水平线，低于这个水平线就需要更新了
    // const lowLine = pageSize / 2 || 7

    if (
      this.state.allReady || // 前端分页模式
      onlyOnePage // 只有一页，不需要考虑下一页补全问题
      // 暂时不考虑，每次删除都刷新
      // currentPageLength - ids.length > lowLine // 删除后高于水平线
    ) {
      // remove in replace
      let dirty = false
      for (const id of ids) {
        const index = dataSource.findIndex(i => i[idKey] === id)
        if (index !== -1) {
          dataSource.splice(index, 1)
          dirty = true
        }
      }

      if (dirty) {
        this.setState({
          dataSource,
          pagination: {
            ...this.state.pagination,
            total: total - 1,
          },
        })
      }
    } else {
      // reload
      this.search(false, false)
    }

    this.removeSelectedKeys(ids)
  }

  private removeSelectedKeys(ids: any[]) {
    const idKey = this.props.idKey as string
    const keys = [...this.state.selected.keys]
    const rows = [...this.state.selected.rows]
    for (const id of ids) {
      const keyIndex = keys.indexOf(id)
      if (keyIndex !== -1) {
        keys.splice(keyIndex, 1)
      }

      const rowIndex = rows.findIndex(i => i[idKey] === id)
      if (rowIndex !== -1) {
        rows.splice(rowIndex, 1)
      }
    }
    this.setState({
      selected: {
        keys,
        rows,
      },
    })
  }

  private defaultRenderer = () => {
    const { className, style } = this.props
    return (
      <div className={`jm-table ${className || ''}`} style={style}>
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
          {header(form, defaultValues, this)}
          <Form.Item>
            <Button loading={loading} type="primary" htmlType="submit">
              {searchText}
            </Button>
          </Form.Item>
          {!!headerExtra && typeof headerExtra === 'function'
            ? headerExtra(form, defaultValues, this)
            : headerExtra}
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
      idKey,
      enablePagination,
      enableSelect,
      filterKey,
      filterValue,
      expandedRowRender,

      showHeader,
      title,
      size,
      bordered,
      scroll,
      locale,
      indentSize,
    } = this.props
    const { pagination, loading, selected, error } = this.state
    const { dataSource, filteredDataSource } = this.state
    const rowSelection = enableSelect
      ? {
          selectedRowKeys: selected.keys,
          onSelect: this.handleSelect,
          onSelectAll: this.handleSelectAll,
        }
      : undefined

    return (
      <>
        {!!error && (
          <Alert
            banner
            message={
              <span>
                数据加载失败(
                {error.message}
                ), <a onClick={this.retry}>重试</a>
              </span>
            }
          />
        )}
        <Table
          columns={this.enhanceColumns()}
          rowKey={idKey}
          loading={loading}
          pagination={enablePagination ? pagination : undefined}
          rowSelection={rowSelection}
          dataSource={
            !!filterKey && !!filterValue ? filteredDataSource : dataSource
          }
          onExpand={this.handleTreeExpand}
          expandedRowKeys={this.state.expandedKeys}
          expandedRowRender={expandedRowRender}
          footer={this.renderFooter()}
          {...{ size, bordered, showHeader, title, scroll, locale, indentSize }}
        />
      </>
    )
  }

  private renderFooter = () => {
    if (this.props.footer) {
      return () => {
        return this.props.footer!(this)
      }
    }
    return undefined
  }

  private enhanceColumns = (): ColumnProps<T>[] => {
    return this.props.columns.map(column => {
      if (column.render) {
        const org = column.render
        return {
          ...column,
          render: (text: any, record: T, index: number) => {
            return org(record, index, this)
          },
        }
      } else {
        return {
          ...column,
          render: (text: any, record: T, index: number) => {
            if ((text == null || text === '') && column.showHrWhenEmpty) {
              return <div className="jm-table__empty-column" />
            }
            return text
          },
        }
      }
    })
  }

  /**
   * 设置dataSource
   */
  private setDataSource(dataSource: T[]) {
    if (this.props.onChange) {
      this.props.onChange(dataSource)
    } else {
      this.setState({
        dataSource,
      })
    }
  }

  /**
   * 初始化状态
   */
  private initialState() {
    const {
      namespace,
      onInit,
      defaultPagination,
      enablePersist,
      onChange,
      search,
    } = this.props

    // 可控模式
    if (onChange != null) {
      this.state.allReady = true
    }

    const query = search.get(namespace)
    if (enablePersist) {
      // 初始化分页信息
      this.state.pagination.pageSize = query.getInt(
        'pageSize',
        (defaultPagination && defaultPagination.pageSize) || 15,
      )
      this.state.pagination.current = query.getInt(
        'current',
        (defaultPagination && defaultPagination.current) || 1,
      )
    }
    // 初始化表单默认值
    if (onInit) {
      this.defaultValues =
        (typeof onInit === 'function' ? onInit(query) : onInit) || {}
    }
  }

  private retry = () => {
    this.search(false, false)
  }

  /**
   * 选择全部
   */
  private handleSelectAll = (
    selected: boolean,
    selectedRows: Object[],
    changeRow: Object[],
  ) => {
    const idKey = this.props.idKey as string
    const keys = [...this.state.selected.keys]
    const rows = [...this.state.selected.rows]
    if (selected) {
      for (let i of changeRow) {
        keys.push(i[idKey])
        rows.push(i as T)
      }
    } else {
      for (let i of changeRow) {
        const index = keys.findIndex(id => i[idKey] === id)
        if (index !== -1) {
          keys.splice(index, 1)
          rows.splice(index, 1)
        }
      }
    }

    this.setState({
      selected: {
        keys,
        rows,
      },
    })
  }

  /**
   * 处理树展开和关闭
   */
  private handleTreeExpand = (expanded: boolean, record: T) => {
    const expandedKeys = this.state.expandedKeys
    const idKey = this.props.idKey || 'id'
    const key = record[idKey]
    if (expanded) {
      if (expandedKeys == null) {
        this.setState({
          expandedKeys: [key],
        })
      } else {
        this.setState({
          expandedKeys: [...expandedKeys, key],
        })
      }
    } else {
      if (expandedKeys != null) {
        const index = expandedKeys.indexOf(key)
        if (index !== -1) {
          expandedKeys.splice(index, 1)
          this.setState({
            expandedKeys,
          })
        }
      }
    }
  }

  /**
   * 单选
   */
  private handleSelect = (record: T, selected: boolean) => {
    const idKey = this.props.idKey as string
    const keys = [...this.state.selected.keys]
    const rows = [...this.state.selected.rows]
    if (selected) {
      keys.push(record[idKey])
      rows.push(record)
    } else {
      const index = keys.findIndex(i => record[idKey] == i)
      if (index !== -1) {
        keys.splice(index, 1)
        rows.splice(index, 1)
      }
    }
    this.setState({
      selected: {
        keys,
        rows,
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

  private async handleShift(
    from: T,
    to: T | null,
    dir: 'up' | 'down',
    onSuccess: () => void,
  ) {
    if (!this.props.onShift) {
      onSuccess()
      return
    }

    try {
      this.setState({ loading: true })
      await this.props.onShift(from, to, dir)
      onSuccess()
    } catch (err) {
      message.error(err.message)
    } finally {
      this.setState({ loading: false })
    }
  }

  private async handleRemove(ids: string[]) {
    if (!this.props.onRemove) {
      this.syncAfterRemove(ids)
      return
    }

    try {
      this.setState({
        loading: true,
      })
      await this.props.onRemove(ids)
      this.syncAfterRemove(ids)
    } catch (err) {
      message.error(err.message)
    } finally {
      this.setState({ loading: false })
    }
  }

  private updateFilterStatus() {
    const { dataSource, expandedKeys } = this.filterAndGetExpandedKeys(
      this.props,
      this.state.dataSource,
    )

    this.setState({
      filteredDataSource: dataSource,
      expandedKeys,
    })
  }

  private filterAndGetExpandedKeys<T, P extends object>(
    props: Props<T, P>,
    list: T[],
  ) {
    if (list == null || list.length === 0) {
      return {
        dataSource: undefined,
        expandedKeys: [],
      }
    }

    const { idKey, filterKey, filterValue } = props

    if (!filterKey || !filterValue) {
      return {
        dataSource: undefined,
        expandedKeys: [...this.defaultExpandedKeys],
      }
    }

    let dataSource = list
    let expandedKeys: string[] = []
    const data = filterDataSource(
      list,
      idKey || 'id',
      filterKey,
      filterValue,
      expandedKeys,
    )
    dataSource = data

    return { dataSource, expandedKeys }
  }

  private genDefaultExpandedKeys(list: T[]) {
    const { defaultExpandedLevel, idKey } = this.props
    if (
      defaultExpandedLevel &&
      defaultExpandedLevel > 0 &&
      list &&
      list.length
    ) {
      return getExpandKeyByLevel(list, defaultExpandedLevel, idKey || 'id')
    }
    return []
  }

  /**
   * 搜索
   * @param validate 开启验证
   * @param resetPage 是否重置页码
   */
  private search = (
    validate: boolean = false,
    resetPage: boolean = true,
    immediatedExtraParams?: Partial<P>,
    triggerBySubmit?: boolean,
  ) => {
    const doit = (values: any) => {
      if (triggerBySubmit && this.props.onSubmit) {
        if (!this.props.onSubmit(values)) {
          return
        }
      }

      if (resetPage) {
        this.setState({
          pagination: {
            ...this.state.pagination,
            current: 1,
          },
        })
      }
      const extraParams = {
        ...((immediatedExtraParams as object) || {}),
        ...(this.props.getExtraParams
          ? (this.props.getExtraParams() as object)
          : {}),
      }
      window.setTimeout(() => {
        this.fetchList({ ...(extraParams as object), ...values })
      })
    }

    if (validate) {
      this.props.form.validateFields((errors, values) => {
        if (errors != null) {
          return
        }
        doit(values)
      })
    } else {
      const values = this.props.form.getFieldsValue()
      doit(values)
    }
  }

  /**
   * 获取列表
   */
  private fetchList = async (extraParams: Partial<P> = {}) => {
    const { loading, pagination } = this.state
    if (loading || this.props.onFetch == null) {
      return
    }

    const {
      offsetMode,
      onFetch,
      onPersist,
      namespace,
      enablePersist,
    } = this.props
    let { current = 1, pageSize = 15 } = pagination

    const paramsToSerial = {
      current,
      pageSize,
      ...(extraParams as object),
    }

    if (offsetMode) {
      current = (current - 1) * pageSize
    }

    const params = {
      ...(extraParams as object),
      current,
      pageSize,
    }

    try {
      this.setState({
        allReady: false,
        error: undefined,
        loading: true,
      })
      const { list, total } = await onFetch(params as P & PaginationInfo)
      this.setState(
        {
          pagination: {
            ...this.state.pagination,
            total,
          },
          dataSource: list,
          allReady: total === list.length,
        },
        () => {
          // 页码纠正
          if (total != 0 && list.length === 0 && paramsToSerial.current !== 1) {
            // 说明页码偏移了
            const correctPage = Math.ceil(total / pageSize)
            this.setState({
              pagination: {
                ...this.state.pagination,
                current: correctPage,
              },
              loading: false,
            })
            // 重试
            setTimeout(() => {
              this.fetchList(extraParams)
            }, 100)
            return
          }

          if (enablePersist) {
            this.props.search.set(
              namespace as string,
              onPersist ? onPersist(paramsToSerial as any) : paramsToSerial,
            )
          }
        },
      )
    } catch (error) {
      this.setState({
        error,
      })
    } finally {
      this.setState({
        loading: false,
      })
    }
  }
}
