import React from 'react'
import { Action, Role } from './type'
import { Context } from './Provider'

export interface AllowsProps {
  /** 指定允许操作的Action， 可以是数组形式 */
  action?: Action[] | Action
  /**
   * 指定允许操作的角色， 可以是数组形式
   */
  role?: Role[] | Role
  /**
   * 附加的and条件
   */
  and?: boolean | (() => boolean)
  /**
   * 附加的or条件
   */
  or?: boolean | (() => boolean)
  /**
   * 指定检查的类型:
   * all 必须具备所有actions权限;
   * some 具备其中一个action权限，默认值
   * @default 'some'
   */
  type?: 'all' | 'some'
  /**
   * 当条件不满足渲染的内容
   */
  otherwise?: React.ReactNode
  /**
   * 当条件满足时渲染的内容
   */
  children: React.ReactNode
}

/**
 * Allows 只有当前角色匹配指定条件时才允许渲染内容
 */
export default class Allows extends React.Component<AllowsProps> {
  public render() {
    return (
      <Context.Consumer>
        {({ allowsAll, allowsSome, is }) => {
          const {
            action,
            role,
            children,
            and,
            or,
            type,
            otherwise,
            ...props
          } = this.props
          const andCond =
            and == null ? true : typeof and === 'function' ? and() : !!and
          let ok: boolean = false

          if (andCond) {
            if (action != null) {
              const actions = Array.isArray(action) ? action : [action]
              const determiner = type === 'all' ? allowsAll : allowsSome
              ok = determiner(...actions)
            } else if (role != null) {
              const roles = Array.isArray(role) ? role : [role]
              ok = is(...roles)
            } else {
              throw TypeError('Must provide action or role')
            }
          }

          const orCond =
            or == null ? false : typeof or === 'function' ? or() : !!or

          return (andCond && ok) || orCond
            ? children && React.isValidElement(children)
              ? React.cloneElement(children, props)
              : children
            : otherwise || null
        }}
      </Context.Consumer>
    )
  }
}
