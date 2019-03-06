/**
 * TODO: 支持批量上移下移
 * TODO: 增强column的功能，支持nowrap，排序等功能
 * TODO: 处理Table onChange 事件，完善排序，过滤状态的处理
 * TODO: 性能优化
 * TODO: 受控模式支持分页等请求
 */
import React from 'react'
import { FormComponentProps } from 'antd/es/form'
import Table, { ColumnProps } from 'antd/es/table'
import Alert from 'antd/es/alert'
import Modal from 'antd/es/modal'
import { PaginationProps } from 'antd/es/pagination'
import message from 'antd/es/message'
import memoize from 'lodash/memoize'
import { QueryComponentProps } from '../query'

import { DefaultPagination } from './constants'
import {
  getExpandKeyByLevel,
  filterDataSource,
  findAndReplace,
  isTree,
  findAndReplaceWithReplacer,
} from './utils'
import {
  FatTableProps,
  FatTableRenderer,
  IFatTable,
  PaginationInfo,
  Setter,
} from './type'
import TableRow from './TableRow'
import Header from './Header'

export interface Props<T, P extends object>
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
  // 编辑
  /**
   * 当前编辑id
   */
  editing?: T
  /**
   * snapshot, 用于保存编辑状态
   */
  snapshot?: T
  /**
   * 保存错误
   */
  saveError?: Error
}

const components = {
  body: { row: TableRow },
}

export default class FatTableInner<T extends object, P extends object>
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
  private tableInstance = React.createRef<Table<T>>()

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
    if (this.state.dataSource && this.canExpand(this.state.dataSource)) {
      this.defaultExpandedKeys = this.genDefaultExpandedKeys(
        this.state.dataSource,
      )
      this.updateFilterStatus()
    }

    // 初始化加载列表
    if (this.props.fetchOnMount && this.props.onChange == null) {
      this.search(false, false)
    }

    // 监听组件大小变化，取消列固定
    if (this.props.scroll && this.props.scroll.x) {
      this.handleResize()
      window.addEventListener('resize', this.handleResize)
    }
  }

  public componentDidUpdate(prevProps: Props<T, P>, prevState: State<T>) {
    const dataSourceChange =
      this.state.dataSource !== prevState.dataSource &&
      this.canExpand(this.state.dataSource) &&
      this.isStructuralChange(this.state.dataSource, prevState.dataSource)

    if (dataSourceChange) {
      // 对于结构性变动需要重新生成默认展开keys
      this.defaultExpandedKeys = this.genDefaultExpandedKeys(
        this.state.dataSource,
      )
    }

    // 树形表格过滤
    if (
      dataSourceChange ||
      prevProps.filterKey !== this.props.filterKey ||
      prevProps.filterValue !== this.props.filterValue
    ) {
      this.updateFilterStatus()
    }
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }

  public render() {
    const renderer: FatTableRenderer<T, P> =
      this.props.children || this.defaultRenderer

    if (typeof renderer === 'function') {
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
    return this.props.children
  }

  public setEditing = (record: T) => {
    this.setState({
      editing: record,
      snapshot: undefined,
      saveError: undefined,
    })
  }

  public cancelEdit = () => {
    this.setState({
      editing: undefined,
      snapshot: undefined,
      saveError: undefined,
    })
  }

  /**
   * 将编辑数据保存到临时空间
   */
  public setSnapshot = (setter: Setter<T>) => {
    if (this.state.editing == null) {
      throw new Error('[fat-table] saveEditSnapshot 只能在当前编辑的行中使用')
    }

    const prevValue = this.state.snapshot || this.state.editing

    // @ts-ignore
    const snapshot = typeof setter === 'function' ? setter(prevValue) : setter

    this.setState({
      snapshot: {
        // @ts-ignore
        ...(prevValue || {}),
        ...(snapshot || {}),
      },
    })
  }

  public save = async () => {
    const { onSave } = this.props
    if (onSave == null) {
      throw new Error('[fat-table] onSave prop 未定义')
    }

    if (this.state.editing == null) {
      throw new Error('[fat-table] save 只能在当前编辑的行中使用')
    }

    // 未变动
    if (this.state.snapshot == null) {
      this.setState({
        editing: undefined,
        snapshot: undefined,
        saveError: undefined,
      })
      return
    }

    try {
      this.setState({ loading: true, saveError: undefined })
      const snapshot = this.state.snapshot
      await onSave(snapshot)
      // 保存成功
      this.setState({
        editing: undefined,
        snapshot: undefined,
      })
      // 保存到dataSource
      this.updateItem(snapshot)
    } catch (error) {
      message.error(error.message)
      this.setState({ saveError: error })
    } finally {
      this.setState({ loading: false })
    }
  }

  /**
   * 获取当前请求参数
   */
  public getParams() {
    const value = this.props.form.getFieldsValue() as P
    const { current, pageSize } = this.getPagination()
    return {
      ...value,
      current,
      pageSize,
    }
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
   * 获取数据源长度
   */
  public length = () => {
    const list = this.getList()
    return list ? list.length : 0
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
    this.cancelEdit()
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
   * 查看替换
   */
  public findAndReplace(id: string, replacer: (item: T) => T) {
    const dataSource = this.state.dataSource
    const idKey = this.props.idKey as string
    const newDataSource = findAndReplaceWithReplacer(
      dataSource,
      idKey,
      id,
      replacer,
    )
    if (dataSource !== newDataSource) {
      this.setDataSource(newDataSource)
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

    let dataSource = this.state.dataSource
    for (const item of items) {
      dataSource = findAndReplace(dataSource, item, idKey)
    }

    if (dataSource !== this.state.dataSource) {
      this.setDataSource(dataSource)
    }
  }

  /**
   * 更新单个元素
   */
  public updateItem = (item: T) => {
    const { idKey } = this.props
    const dataSource = findAndReplace(this.state.dataSource, item, idKey!)
    if (dataSource !== this.state.dataSource) {
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

  public triggerAction(action: string, data: any) {
    if (this.props.onAction) {
      this.props.onAction(action, data, this)
    }
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
    return (
      <Header
        {...{
          header,
          headerExtra,
          searchText,
          form,
          loading,
          defaultValues,
          table: this,
        }}
      />
    )
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
          ref={this.tableInstance}
          components={components}
          columns={this.enhanceColumns()}
          rowKey={idKey}
          loading={loading}
          pagination={enablePagination ? pagination : false}
          rowSelection={rowSelection}
          dataSource={
            !!filterKey && !!filterValue ? filteredDataSource : dataSource
          }
          onExpand={this.handleTreeExpand}
          onRow={this.onRow}
          expandedRowKeys={this.state.expandedKeys}
          expandedRowRender={expandedRowRender}
          footer={this.renderFooter()}
          {...{
            size,
            bordered,
            showHeader,
            title,
            scroll,
            locale,
            indentSize,
          }}
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

  /**
   * 扩展column的功能
   */
  private enhanceColumns = memoize(
    (): ColumnProps<T>[] => {
      const { idKey } = this.props
      return this.props.columns.map(column => {
        if (column.render) {
          const org = column.render
          return {
            ...column,
            render: (text: any, record: T, index: number) => {
              // snapshot 优先
              const { snapshot, editing } = this.state
              const isEditing = editing && record[idKey!] === editing[idKey!]
              const r = snapshot && isEditing ? snapshot : record
              return org(r, index, this, !!isEditing)
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
    },
  )

  private onRow = (record: T, index: number) => {
    if (
      this.state.saveError &&
      this.state.editing &&
      this.state.editing[this.props.idKey!] === record[this.props.idKey!]
    ) {
      return { error: this.state.saveError }
    }

    return {}
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

    const query = search.getter(namespace)
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

    // 异步获取下级节点
    this.loadChildrenIfNeed(record)

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

  private async loadChildrenIfNeed<P extends T & { children?: T[] }>(
    record: P,
  ) {
    // 不存在下级或已经有下级
    if (record.children == null || record.children.length !== 0) {
      return
    }

    if (this.props.onFetchChildren == null) {
      return
    }

    const idKey = this.props.idKey || 'id'
    const key = record[idKey]
    const params = this.getParams()

    try {
      this.setState({
        loading: true,
      })
      const children = await this.props.onFetchChildren(key, record, params)
      if (Array.isArray(children) && children.length !== 0) {
        record.children = children
      } else {
        record.children = undefined
      }
      this.updateItem(record)
    } catch (err) {
      message.error(err.message)
    } finally {
      this.setState({
        loading: false,
      })
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

  private handleResize = () => {
    const tableWrapper =
      this.tableInstance.current &&
      this.tableInstance.current.getPopupContainer()
    const scroll = this.props.scroll
    if (tableWrapper && scroll && scroll.x) {
      const { offsetWidth } = tableWrapper
      const classList = tableWrapper.classList
      if (offsetWidth >= scroll.x) {
        classList.add('prevent-fixed')
      } else {
        classList.remove('prevent-fixed')
      }
    }
  }

  /**
   * 树过滤
   */
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

  /**
   * 是否支持展开
   */
  private canExpand(dataSource: T[]) {
    return !!this.props.expandedRowRender || isTree(dataSource)
  }

  /**
   * 结构性变动
   */
  private isStructuralChange(a: T[], b: T[]) {
    const idKey = this.props.idKey!
    if (a == null || b == null || a.length === 0 || b.length === 0) {
      return true
    }

    return a[0][idKey] !== b[0][idKey]
  }

  /**
   * 生成默认展开的keys
   */
  private genDefaultExpandedKeys(list: T[]) {
    const {
      defaultExpandedLevel,
      idKey,
      defaultExpandAllRows,
      defaultExpandedRows,
    } = this.props

    if (defaultExpandedRows) {
      return defaultExpandedRows(list)
    } else if (!isTree(list) && defaultExpandAllRows) {
      return this.getIds(list)
    }

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

  private getPagination() {
    const { offsetMode } = this.props
    const { pagination } = this.state
    let { current = 1, pageSize = 15 } = pagination
    let page = current
    if (offsetMode) {
      current = (current - 1) * pageSize
    }

    return {
      current,
      pageSize,
      page,
    }
  }

  private getIds(list: T[]) {
    return list.map(i => i[this.props.idKey!])
  }

  /**
   * 获取列表
   */
  private fetchList = async (extraParams: Partial<P> = {}) => {
    const { loading } = this.state
    if (loading || this.props.onFetch == null) {
      return
    }

    const {
      onFetch,
      onPersist,
      namespace,
      enablePersist,
      lazyMode,
    } = this.props
    const { page, current, pageSize } = this.getPagination()

    const paramsToSerial = {
      current: page,
      pageSize,
      ...(extraParams as object),
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
          expandedKeys: lazyMode ? [] : this.state.expandedKeys,
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
