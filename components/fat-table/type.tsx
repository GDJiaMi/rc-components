import { PaginationProps } from 'antd/lib/pagination'
import { ColumnProps, TableProps } from 'antd/lib/table'
import { FormComponentProps } from 'antd/lib/form'
import { CSSProperties } from 'react'
import { QueryGetter } from '../query'

export interface PaginationInfo {
  current: number
  pageSize: number
}

export interface ListInfo<T> {
  // 数据总条目数
  total: number
  list: T[]
}

export type FormProps = FormComponentProps['form']

/**
 * FatTable 可用操作
 */
export interface IFatTable<T, P> {
  fetch(validate?: boolean, resetPage?: boolean, extraParams?: Partial<P>): void
  getSelected(): T[]
  getSelectedIds(): any[]
  clearSelected(): void
  clearForm(): void
  getList(): T[]
  setList(list: T[]): void
  remove(ids: any[]): void
  shift(id: any, dir?: 'up' | 'down'): void
  submit(evt: React.FormEvent<void>): void
  canShiftUp(id: string): boolean
  canShiftDown(id: string): boolean
  updateItems(updator: (list: T[]) => T[]): void
  updateItem(item: T): void
}

/**
 * 渲染器类型声明
 */
export type FatTableRenderer<T, P> = ((
  form: FormProps,
  defaultValues: Partial<P>,
  slots: {
    body: (props?: TableProps<T>) => React.ReactNode
    header: () => React.ReactNode
  },
  instance: IFatTable<T, P>,
) => React.ReactNode)

export type HeaderRenderer<T, P> = (
  form: FormProps,
  defaultValues: Partial<P>,
) => React.ReactNode

export type FooterRenderer<T, P> = () => React.ReactNode

/**
 * 处理器类型声明
 */
// onInit
export type InitHandler<T, P> = ((query: QueryGetter) => Partial<P>)

// onFetch
export type FetchHandler<T, P> = (
  params: P & PaginationInfo,
) => Promise<ListInfo<T>>

// onShift
export type ShiftHandler<T, P> = (form: T, type: 'up' | 'down') => Promise<void>

// onRemove
export type RemoveHandler<T, P> = (ids: any[]) => Promise<void>

// onChange
export type ChangeHandler<T, P> = (list: T[]) => void

// onPersist
export type PersistHandler<T, P> = (params: P & PaginationInfo) => object

export interface FatTableProps<T, P extends object> {
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

  // 头部，用于渲染通用的搜索表单
  header?: HeaderRenderer<T, P>
  // 用于获取自定义的请求参数, 即form之外的请求参数
  getExtraParams?: () => Partial<P>
  // 初始化，主要用于设置参数默认值
  onInit?: Partial<P> | InitHandler<T, P>
  // 搜索按钮后面的扩展按钮
  headerExtra?: React.ReactNode
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
  columns: ColumnProps<T>[]
  footer?: FooterRenderer<T, P>
  size?: 'default' | 'middle' | 'small'
  borderred?: boolean

  // id主键，默认为id
  idKey?: string
  className?: string
  style?: CSSProperties

  /**
   * 其他
   */
  // 在删除时显示确认
  confirmOnRemove?: boolean
  // 上移下移操作
  onShift?: ShiftHandler<T, P>
  // 删除操作
  onRemove?: RemoveHandler<T, P>
  // URL持久化钩子, 返回需要被持久化的对象
  onPersist?: PersistHandler<T, P>
}
