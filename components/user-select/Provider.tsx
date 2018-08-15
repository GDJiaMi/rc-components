/**
 * Provider
 * 1. 用于提供全局的缓存store，避免重复请求
 * 2. 提供api接口适配器配置
 */
import React from 'react'

/**
 * 企业
 */
export interface TenementDesc {
  id: string
  name: string
  // 扩展字段，自定义，用户选择器不会关心这里面的内容
  extra?: any
}

/**
 *  部门树
 */
export interface DepartmentDesc {
  id: string
  // 部门名称
  name: string
  // 用户数(不包括下级部门)
  userCount?: string
  // 默认是否展开
  open?: boolean
  // 子部门
  children?: DepartmentDesc[]
  // 关联的企业，不是所有情况都存在，主要用于格式化/展示
  tenement?: TenementDesc
  // 扩展字段，自定义，用户选择器不会关心这里面的内容
  extra?: any
}

/**
 * 成员
 */
export interface UserDesc {
  id: string
  name: string
  // 手机号码
  mobile: string
  // 扩展字段，自定义，用户选择器不会关心这里面的内容
  extra?: any
  // 关联的企业或部门
  tenement?: TenementDesc
  department?: DepartmentDesc
}

export interface Adaptor {
  /**
   * 获取部门树
   */
  getDepartmentTree(tenementId: string): Promise<DepartmentDesc>
  /**
   * 获取部门成员
   */
  getDepartmentUsers(
    tenementId: string,
    departmentId: string,
    page: number,
    pageSize: number,
  ): Promise<{ items: UserDesc[]; total: number }>
  /**
   * 用户搜索
   */
  searchUser(
    query: string,
    page: number,
    pageSize: number,
  ): Promise<{ items: UserDesc[]; total: number }>
  /**
   * 企业搜索
   */
  searchTenement(
    query: string,
    page: number,
    pageSize: number,
  ): Promise<{ items: TenementDesc[]; total: number }>
}

export interface ProviderProps {
  adaptor: Adaptor
}

interface State {
  // 以tenementId为键进行缓存
  departmentTrees: Map<string, DepartmentDesc>
  // 以tenementId-departmentsId为键进行缓存
  departmentUsers: Map<
    string,
    { list: { [page: string]: UserDesc[] }; total: number }
  >
  // 首页
  defaultTenements?: { items: TenementDesc[]; total: number }
  // 首页
  defaultUsers?: { items: UserDesc[]; total: number }
}

export const Context = React.createContext<Adaptor>({} as Adaptor)

/**
 * UserSelect Provider
 */
export default class Provider extends React.Component<ProviderProps> {
  // 缓存
  public store: State = {
    departmentTrees: new Map(),
    departmentUsers: new Map(),
  }

  private contextValue: Adaptor

  public componentWillMount() {
    this.contextValue = {
      getDepartmentTree: this.getDepartmentTree,
      getDepartmentUsers: this.getDepartmentUsers,
      searchUser: this.searchUser,
      searchTenement: this.searchTenement,
    }
  }

  public render() {
    return (
      <Context.Provider value={this.contextValue}>
        {this.props.children}
      </Context.Provider>
    )
  }

  private getDepartmentTree = async (
    tenement: string,
  ): Promise<DepartmentDesc> => {
    if (this.store.departmentTrees.has(tenement)) {
      return this.store.departmentTrees.get(tenement) as DepartmentDesc
    }
    const tree = await this.props.adaptor.getDepartmentTree(tenement)
    this.store.departmentTrees.set(tenement, tree)
    return tree
  }

  private getDepartmentUsers = async (
    tenementId: string,
    departmentId: string,
    page: number,
    pageSize: number,
  ): Promise<{ items: UserDesc[]; total: number }> => {
    const key = `${tenementId}-${departmentId}`
    const users = this.store.departmentUsers.get(key)
    if (users && users.list && users.list[page] != null) {
      return { items: users.list[page], total: users.total }
    }
    const res = await this.props.adaptor.getDepartmentUsers(
      tenementId,
      departmentId,
      page,
      pageSize,
    )
    this.store.departmentUsers.set(key, {
      list: { ...((users && users.list) || {}), [page]: res.items },
      total: res.total,
    })

    return res
  }

  private searchUser = async (
    query: string,
    page: number,
    pageSize: number,
  ): Promise<{ items: UserDesc[]; total: number }> => {
    const isDefaultQuery = query == ''
    if (isDefaultQuery && page === 1 && this.store.defaultUsers) {
      return this.store.defaultUsers
    }
    const res = await this.props.adaptor.searchUser(query, page, pageSize)
    this.store.defaultUsers = res
    return res
  }

  private searchTenement = async (
    query: string,
    page: number,
    pageSize: number,
  ): Promise<{ items: TenementDesc[]; total: number }> => {
    const isDefaultQuery = query == ''
    if (isDefaultQuery && page === 1 && this.store.defaultTenements) {
      return this.store.defaultTenements
    }
    const res = await this.props.adaptor.searchTenement(query, page, pageSize)
    this.store.defaultTenements = res
    return res
  }
}
