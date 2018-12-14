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
  getDefaultValues(): Partial<P>
  setList(list: T[]): void
  remove(ids: any[]): void
  removeSelected(): void
  // handle* 可以直接用于事件绑定
  handleRemoveSelected(): void
  shiftUp(id: any): void
  shiftDown(id: any): void
  shift(id: any, dir?: 'up' | 'down'): void
  submit(evt: React.FormEvent<void>): void
  canShiftUp(id: string): boolean
  canShiftDown(id: string): boolean
  updateItems(updator: (list: T[]) => T[]): void
  updateItem(item: T): void
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
) => React.ReactNode

/**
 * 处理器类型声明
 */
// onInit
export type InitHandler<T, P = {}> = ((query: QueryGetter) => Partial<P>)

// onFetch
export type FetchHandler<T, P = {}> = (
  params: P & PaginationInfo,
) => Promise<ListInfo<T>>

export type SubmitHandler<T, P = {}> = (params: P) => boolean

// onShift
export type ShiftHandler<T, P = {}> = (
  from: T,
  to: T | null,
  type: 'up' | 'down',
) => Promise<void>

// onRemove
export type RemoveHandler<T, P = {}> = (ids: any[]) => Promise<void>

// onChange
export type ChangeHandler<T, P = {}> = (list: T[]) => void

// onSave
export type SaveHandler<T, P = {}> = (snapshot: T) => Promise<void>

// onPersist
export type PersistHandler<T, P = {}> = (params: P & PaginationInfo) => object

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
  // 查询事件, 返回一个Promise，表格会根据Promise的状态设置loading或展示错误信息
  // Promise将resolve列表信息
  onFetch?: FetchHandler<T, P>
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
   * 树形表格相关
   */
  defaultExpandedLevel?: number
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
