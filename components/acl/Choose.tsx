import React from 'react'
import { Context } from './Provider'
import { Action, Role } from './type'

export interface ChooseProps {
  children: React.ReactNode
}

type MaybeArray<T> = T[] | T

/**
 * 根据权限在子元素中选择可以展示的组件
 * @example
 * <Choose>
 *   <Choose.Option action={[A, B]}>hello world</Choose.Option>
 *   <Choose.Option action={C}>hello c</Choose.Option>
 *   <Choose.Option role={[RoleA, RoleB]}>hello roles</Choose.Option>
 *   <Choose.Option role={RoleC}>hello role c</Choose.Option>
 *   <div>other</div>
 * </Choose>
 */
export default class Choose extends React.Component<ChooseProps> {
  public static Option = Option
  public render() {
    const { children } = this.props
    return (
      <Context.Consumer>
        {({ allowsSome, is }) => {
          return React.Children.map(children, child => {
            if (
              React.isValidElement<{
                user?: MaybeArray<Role>
                action?: MaybeArray<Action>
              }>(child)
            ) {
              if (child.props.action != null) {
                // 匹配权限
                const actions = child.props.action
                const normalized: Action[] = Array.isArray(actions)
                  ? actions
                  : [actions]
                if (allowsSome(...normalized)) {
                  return child
                }

                return null
              } else if (child.props.user != null) {
                // 匹配角色
                const user = child.props.user
                const normalized = Array.isArray(user) ? user : [user]
                if (is(...normalized)) {
                  return child
                }

                return null
              }
            }

            return child
          })
        }}
      </Context.Consumer>
    )
  }
}

/**
 * 类似于React Router的Switch组件，从Option中选取一个，忽略后续的Option
 * @example
 * <Switch>
 *   <Switch.Option action={A}>one</Switch.Option>
 *   <Switch.Option action={[B, C]}>two</Switch.Option>
 *   <Switch.Option role={[RoleA, RoleB]}>three</Switch.Option>
 * </Switch>
 */
export class Switch extends React.Component {
  public static Option = Option
  public render() {
    return (
      <Context.Consumer>
        {({ allowsSome, is }) => {
          let match: React.ReactChild | null = null
          React.Children.forEach(this.props.children, child => {
            if (
              match == null &&
              React.isValidElement<{
                user?: MaybeArray<Role>
                action?: MaybeArray<Action>
              }>(child)
            ) {
              // 合法组件
              if (child.props.action != null) {
                // 匹配权限
                const actions = child.props.action
                const normalized: Action[] = Array.isArray(actions)
                  ? actions
                  : [actions]
                if (allowsSome(...normalized)) {
                  match = child
                }
              } else if (child.props.user != null) {
                // 匹配角色
                const user = child.props.user
                const normalized = Array.isArray(user) ? user : [user]
                if (is(...normalized)) {
                  match = child
                }
              }
            }
          })
          return match
        }}
      </Context.Consumer>
    )
  }
}

export type ChooseOptionProps =
  | {
      action: Action | Action[]
      children: React.ReactNode
    }
  | {
      user: Role | Role[]
      children: React.ReactNode
    }

export function Option(props: ChooseOptionProps) {
  return props.children
}
