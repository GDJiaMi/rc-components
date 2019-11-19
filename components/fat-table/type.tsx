import { Omit } from '../utils/type-utils'
import { PaginationProps } from 'antd/es/pagination'
import { ColumnProps, TableProps, TableLocale } from 'antd/es/table'
import { FormComponentProps } from 'antd/es/form'
import { CSSProperties } from 'react'
import { QueryGetter } from '../query'

export type FormProps = FormComponentProps['form']
export interface PaginationInfo {
  current: number
  pageSize: number
}

export type ColumnType<T, P = {}> = Omit<ColumnProps<T>, 'render'> & {
  // 在无数据时显示空白
  showHrWhenEmpty?: boolean
  render?: (
    record: T,
    index: number,
    instance: IFatTable<T, P>,
    editing: boolean,
  ) => React.ReactNode
}

export type ColumnsType<T, P = {}> = ColumnType<T, P>[]

export interface ListInfo<T> {
  // 数据总条目数
  total: number
  list: T[]
}

export type Setter<T> = Partial<T> | ((prev: T) => Partial<T>)

/**
 * FatTable 可用操作
 */
export interface IFatTable<T, P = {}> {
  fetch(validate?: boolean, resetPage?: boolean, extraParams?: Partial<P>): void
  getSelected(): T[]
  getSelectedIds(): any[]
  clearSelected(): void
  clearForm(): void
  /**
   * 获取查询参数， 可以用于导出
   */
  getParams(): P & PaginationInfo
  getList(): T[]
  length(): number
  getDefaultValues(): Partial<P>
  setList(list: T[]): void
  remove(ids: any[]): void
  removeSelected(): void
  // handle* 可以直接用于事件绑定
  handleRemoveSelected(): void
  shiftUp(id: any): void
  shiftDown(id: any): void
  shift(id: any, dir?: 'up' | 'down'): void
  submit(evt: React.FormEvent<any>): void
  canShiftUp(id: any): boolean
  canShiftDown(id: any): boolean
  updateItems(updator: (list: T[]) => T[]): void
  updateItem(item: T): void
  findAndReplace(id: any, replacer: (item: T) => T): void
  scrollToLastPage(): void
  scrollToFirstPage(): void
  /**
   * 设置当前编辑的行id
   */
  setEditing(record: T): void
  /**
   * 取消编辑
   */
  cancelEdit(): void
  save(): void
  setSnapshot(setter: Setter<T>): void
  /**
   * 触发自定义事件
   */
  triggerAction(action: string, data: any): void
}

/**
 * 渲染器类型声明
 */
export type FatTableRenderer<T, P = {}> = ((
  form: FormProps,
  defaultValues: Partial<P>,
  slots: {
    body: (props?: TableProps<T>) => React.ReactNode
    header: () => React.ReactNode
  },
  instance: IFatTable<T, P>,
) => React.ReactNode)

export type HeaderRenderer<T, P = {}> = (
  form: FormProps,
  defaultValues: Partial<P>,
  instance: IFatTable<T, P>,
) => React.ReactNode

export type HeaderExtraRenderer<T, P = {}> =
  | HeaderRenderer<T, P>
  | React.ReactChild

export type FooterRenderer<T, P = {}> = (
  instance: IFatTable<T, P>,
) => React.ReactNode

export type ExpandedRowRenderer<T, P = {}> = (
  record: T,
  index: number,
  indent: any,
  expanded: boolean,
  instance: IFatTable<T, P>,
) => React.ReactNode

/**
 * generate default expanded rows
 */
export type ExpandedRowsGenerator<T, P = {}> = (
  dataSource: T[],
) => Array<string | number>

/**
 * 处理器类型声明
 */
// onInit
export type InitHandler<T, P = {}> = ((query: QueryGetter) => Partial<P>)

// onFetch
export type FetchHandler<T, P = {}> = (
  params: P & PaginationInfo,
  instance: IFatTable<T, P>,
) => Promise<ListInfo<T>>

// onFetchChildren
export type FetchChildrenHandler<T, P = {}> = (
  id: any,
  record: T,
  params: P & PaginationInfo,
  instance: IFatTable<T, P>,
) => Promise<T[] | undefined>

export type SubmitHandler<T, P = {}> = (params: P) => boolean

// onShift
export type ShiftHandler<T, P = {}> = (
  from: T,
  to: T | null,
  type: 'up' | 'down',
  instance: IFatTable<T, P>,
) => Promise<void>

// onRemove
export type RemoveHandler<T, P = {}> = (
  ids: any[],
  instance: IFatTable<T, P>,
) => Promise<void>

// onChange
export type ChangeHandler<T, P = {}> = (
  list: T[],
  instance: IFatTable<T, P>,
) => void

// onSave
export type SaveHandler<T, P = {}> = (
  snapshot: T,
  instance: IFatTable<T, P>,
) => Promise<void>

// onPersist
export type PersistHandler<T, P = {}> = (
  params: P & PaginationInfo,
  instance: IFatTable<T, P>,
) => object

export type ActionHandler<T, P = {}> = (
  name: string,
  data: any,
  instance: IFatTable<T, P>,
) => void

/**
 * 参数
 */
export interface FatTableProps<T, P extends object = {}> {
  /**
   * 检索相关
   */
  // 指定命名空间，搜索条件和分页会使用查询字符串来继续持久化，保证前进和回退的状态，默认为空
  namespace?: string
  // 是否持久化请求参数(使用查询字符持久化到URL中)，默认为true
  enablePersist?: boolean
  // 是否启用选中，默认为false
  enableSelect?: boolean
  // 是否启用分页, 默认为true
  enablePagination?: boolean
  // 默认分页属性
  defaultPagination?: Partial<PaginationProps>
  // 偏移模式，将分页转换为数据库偏移模式, 默认为true
  offsetMode?: boolean
  // 异步加载树节点
  lazyMode?: boolean
  // 查询事件, 返回一个Promise，表格会根据Promise的状态设置loading或展示错误信息
  // Promise将resolve列表信息
  onFetch?: FetchHandler<T, P>
  // 异步加载子节点
  onFetchChildren?: FetchChildrenHandler<T, P>
  // 在组件挂载时进行fetch，在非受控模式下有效。默认为true
  fetchOnMount?: boolean
  onSubmit?: SubmitHandler<T, P>

  // 头部，用于渲染通用的搜索表单
  header?: HeaderRenderer<T, P>
  // 搜索按钮后面的扩展按钮
  headerExtra?: HeaderExtraRenderer<T, P>
  footer?: FooterRenderer<T, P>
  // 用于获取自定义的请求参数, 即form之外的请求参数
  getExtraParams?: () => Partial<P>
  // 初始化，主要用于设置参数默认值
  onInit?: Partial<P> | InitHandler<T, P>
  // 搜索按钮文本，默认为‘搜索’
  searchText?: string
  // 实现更复杂的界面定制, 一般情况下不需要这么复杂
  children?: FatTableRenderer<T, P>

  /**
   * 可控模式
   * 注意，可控模式和fetch(onFetch)模式只能取其一
   */
  value?: T[]
  onChange?: ChangeHandler<T, P>

  /**
   * 展示相关
   */
  columns: ColumnsType<T, P>
  expandedRowRender?: ExpandedRowRenderer<T, P>

  /**
   * 展开相关
   */
  /**
   * 默认展开深度，支持树形结构
   */
  defaultExpandedLevel?: number
  /**
   * 是否默认展开所有行，支持非树形结构
   */
  defaultExpandAllRows?: boolean
  /**
   * 通过回调生成，默认展开的行. 返回需要展开的id数组
   */
  defaultExpandedRows?: ExpandedRowsGenerator<T, P>
  // 过滤
  filterKey?: string
  filterValue?: string

  // id主键，默认为id
  idKey?: string
  className?: string
  style?: CSSProperties

  /**
   * 其他
   */
  // 在删除时显示确认
  confirmOnRemove?: boolean
  // 删除的提示语
  removeConfirmText?: string
  // 上移下移操作
  // 开发者只负责接口请求，不需要操作数据源
  onShift?: ShiftHandler<T, P>
  // 删除操作
  // 开发者只负责接口请求，不需要操作数据源
  onRemove?: RemoveHandler<T, P>
  // URL持久化钩子, 返回需要被持久化的对象
  onPersist?: PersistHandler<T, P>
  onSave?: SaveHandler<T, P>
  onAction?: ActionHandler<T, P>

  /**
   * 转发给Table
   */
  showHeader?: boolean
  title?: TableProps<T>['title']
  size?: 'default' | 'middle' | 'small'
  bordered?: boolean
  scroll?: { x?: number | true; y?: number }
  locale?: TableLocale
  indentSize?: number
}
