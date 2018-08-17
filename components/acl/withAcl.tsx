/**
 * 注入acl的帮助方法，实现命令式操作
 */
import React from 'react'
import { ContextValue, Context } from './Provider'
import { Omit } from '../utils/type-utils'

export type AclProps<P extends ContextValue> = Omit<P, keyof ContextValue> & {
  wrappedComponentRef?: React.Ref<any>
}

export type AclInjectedProps = ContextValue

/**
 * FIXME: 当前版本（3.0）对装饰器的支持还比较弱，这个函数作为装饰器使用时会报错，
 * 如果按照这种方式, 则可以正常使用，但是无法设置类型：
 *   return function<T>(Target: T): T {
 * 所以当前版本建议使用函数方式使用
 */
export default function withAcl<P extends ContextValue>(
  Target: React.ComponentClass<P>,
): React.ComponentClass<AclProps<P>> {
  class InjectAcl extends React.Component<AclProps<P>> {
    public render() {
      return (
        <Context.Consumer>
          {props => {
            // @ts-ignore 后续typescript的升级优化
            const { wrappedComponentRef, ...other } = this.props
            return <Target {...other} {...props} ref={wrappedComponentRef} />
          }}
        </Context.Consumer>
      )
    }
  }
  return InjectAcl
}
