import React from 'react'
import Alert from 'antd/es/alert'
import Allows from './Allows'
import { Action } from './type'
import Link from '../link'

export const allowsAll = (...actions: Action[]) =>
  allowsInner('all', undefined, ...actions)
export const allowsSome = (...actions: Action[]) =>
  allowsInner('some', undefined, ...actions)
export const allows = allowsSome

/**
 * allows 装饰器形式, 一般用于装饰路由组件, 访问该页面时会展示无权访问错误信息
 */
export function allowsInner(
  type: 'all' | 'some',
  otherwise: React.ReactNode | undefined,
  ...actions: Action[]
) {
  return function<T extends React.ComponentClass<any>>(Target: T): T {
    class AllowsWrapper extends React.Component {
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
            // @ts-ignore
            children={<Target {...this.props} />}
          />
        )
      }
    }
    return AllowsWrapper as T
  }
}
