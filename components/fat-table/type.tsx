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

/**
 * FatTable 可用操作
 */
export interface IFatTable<T> {
  fetch(validate?: boolean, resetPage?: boolean): void
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
}

export type FatTableRenderer<T, P> = ((
  form: FormComponentProps['form'],
  defaultValues: Partial<P>,
  slots: {
    body: (props?: TableProps<T>) => React.ReactNode
    header: () => React.ReactNode
  },
  instance: IFatTable<T>,
) => React.ReactNode)

export interface FatTableProps<T, P extends object> {
  /**
   * 检索相关
   */
  // 指定命名空间，搜索条件和分页会使用查询字符串来继续持久化，保证前进和回退的状态，默认为空
  namespace?: string
  // 是否持久化请求参数(使用查询字符持久化到URL中)，默认为true
  enablePersist?: boolean
  // 是否启用分页
  enablePagination?: boolean
  // 默认分页属性
  defaultPagination?: Partial<PaginationProps>
  // 偏移模式，将分页转换为数据库偏移模式, 默认为true
  offsetMode?: boolean
  // 查询事件, 返回一个Promise，表格会根据Promise的状态设置loading或展示错误信息
  // Promise将resolve列表信息
  onFetch?: (params: P & PaginationInfo) => Promise<ListInfo<T>>
  fetchOnMount?: boolean

  // 头部，用于渲染通用的搜索表单
  header?: (
    form: FormComponentProps['form'],
    defaultValues: Partial<P>,
  ) => React.ReactNode
  // 用于获取自定义的请求参数
  getExtraParams?: () => Partial<P>
  // 参数默认值
  defaultValues?: Partial<P> | ((query: QueryGetter) => Partial<P>)
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
  onChange?: (list: T[]) => void

  /**
   * 选中相关
   */
  enableSelect?: boolean

  /**
   * 展示相关
   */
  columns: ColumnProps<T>[]
  footer?: () => React.ReactNode
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
}
