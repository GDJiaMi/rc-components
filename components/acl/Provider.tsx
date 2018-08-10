import React from 'react'
import { Rules, Action, Role } from './type'

export interface AclProviderProps {
  // 访问控制列表规则
  rules: Rules
  // 当前角色, 支持多角色
  role: Array<Role> | Role
}

export interface ContextValue {
  /**
   * 从一组规则中选择出允许的字段
   * 例如 choose({[A]: 'foo', [B]: 'bar', '*': 'baz' }), 如果具备A和B权限，则返回['foo', 'bar']
   * '*'表示通配模式
   */
  choose<T>(options: { [action: string]: T; [actionInNumber: number]: T }): T[]
  /**
   * 是否具备指定的所有权限(全部满足)
   */
  allowsAll(...actions: Action[]): boolean
  /**
   * 是否具备指定的权限之一(只要满足其中一个权限)
   */
  allowsSome(...actions: Action[]): boolean
  /**
   * 是否是指定角色
   */
  is(...roles: Role[]): boolean
  // 访问控制列表规则
  rules: Rules
  // 当前角色, 支持多角色
  role: Array<Role>
}

const noop = (...args: any[]) => false
export const Context = React.createContext<ContextValue>({
  choose: () => [],
  allowsAll: noop,
  allowsSome: noop,
  is: noop,
  rules: {},
  role: [],
})

export default class Provider extends React.Component<
  AclProviderProps,
  ContextValue
> {
  public static getDerivedStateFromProps(
    props: AclProviderProps,
    state: ContextValue,
  ) {
    if (props.role != state.role || props.rules != state.rules) {
      return {
        role: Array.isArray(props.role) ? props.role : [props.role],
        rules: props.rules,
      }
    }
    return null
  }

  public constructor(props: AclProviderProps) {
    super(props)
    this.state = {
      allowsAll: this.allowsAll,
      allowsSome: this.allowsSome,
      is: this.is,
      choose: this.choose,
      rules: {},
      role: [],
    }
  }

  public render() {
    return (
      <Context.Provider value={this.state}>
        {this.props.children}
      </Context.Provider>
    )
  }

  choose<T>(options: {
    [action: string]: T
    [actionInNumber: number]: T
  }): T[] {
    const list = []
    for (const action in options) {
      if (!options.hasOwnProperty(action)) {
        continue
      }

      if (action === '*') {
        // 通配模式
        list.push(options[action])
        continue
      }

      if (this.allowsSome(action)) {
        list.push(options[action])
      }
    }
    return list
  }

  private allowsAll = (...actions: Action[]) => {
    const roles = this.state.role
    const rules = this.state.rules

    if (roles.length === 0) {
      return false
    }

    for (const action of actions) {
      let pass = false
      for (const role of roles) {
        // 存在角色，且声明了action
        if (
          rules[role] &&
          rules[role].findIndex(act => act.toString() === action.toString()) !==
            -1
        ) {
          pass = true
          break
        }
      }
      if (pass === false) {
        return false
      }
    }

    return true
  }

  private allowsSome = (...actions: Action[]) => {
    const roles = this.state.role
    const rules = this.state.rules

    if (roles.length === 0) {
      return false
    }

    for (const action of actions) {
      let pass = false
      for (const role of roles) {
        // 存在角色，且声明了action
        if (
          rules[role] &&
          rules[role].findIndex(act => act.toString() === action.toString()) !==
            -1
        ) {
          pass = true
          break
        }
      }
      if (pass === true) {
        return true
      }
    }

    return false
  }

  private is = (...roles: Role[]) => {
    for (const role of roles) {
      if (
        this.state.role.findIndex(r => r.toString() === role.toString()) !== -1
      ) {
        return true
      }
    }
    return false
  }
}
