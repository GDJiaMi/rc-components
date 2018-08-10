import React from 'react'
import Alert from 'antd/lib/alert'
import { Action } from './type'
import { Context } from './Provider'
import Link from '../link'

export interface AllowsProps {
  action: Action[] | Action
  // 附加的and条件
  and?: boolean | (() => boolean)
  // 附加的or条件
  or?: boolean | (() => boolean)
  // all 必须具备所有actions权限
  // some 具备其中一个action权限，默认值
  type?: 'all' | 'some'
  // 当条件不满足渲染的内容
  otherwise?: React.ReactNode
  // 当条件满足时渲染的内容
  children: React.ReactNode
}

/**
 * Allows 组件
 */
export default class Allows extends React.Component<AllowsProps> {
  public render() {
    return (
      <Context.Consumer>
        {({ allowsAll, allowsSome }) => {
          const {
            action,
            children,
            and,
            or,
            type,
            otherwise,
            ...props
          } = this.props
          const actions = Array.isArray(action) ? action : [action]
          const determiner = type === 'all' ? allowsAll : allowsSome
          const andCond =
            and == null ? true : typeof and === 'function' ? and() : !!and
          const orCond =
            or == null ? false : typeof or === 'function' ? or() : !!or

          return (determiner(...actions) && andCond) || orCond
            ? children && React.isValidElement(children)
              ? React.cloneElement(children, props)
              : children
            : otherwise || null
        }}
      </Context.Consumer>
    )
  }
}

/**
 * allows 装饰器形式, 一般用于装饰路由组件, 访问该页面时会展示无权访问错误信息
 */
export function allowsInner(
  type: 'all' | 'some',
  otherwise: React.ReactNode | undefined,
  ...actions: Action[]
) {
  return function<T extends React.ComponentClass<any>>(Target: T): T {
    class AllowsWraper extends React.Component {
      public render() {
        return (
          <Allows
            action={actions}
            type={type}
            otherwise={
              otherwise || (
                <Alert
                  showIcon
                  banner
                  message={
                    <div>
                      无权访问, <Link to="goback">点击返回</Link>
                    </div>
                  }
                  type="error"
                />
              )
            }
          >
            <Target {...this.props} />
          </Allows>
        )
      }
    }
    return AllowsWraper as T
  }
}

export const allowsAll = (...actions: Action[]) =>
  allowsInner('all', undefined, ...actions)
export const allowsSome = (...actions: Action[]) =>
  allowsInner('some', undefined, ...actions)
export const allows = allowsSome
