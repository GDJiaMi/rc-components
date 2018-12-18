import React from 'react'
import { Context } from './Provider'
import { MaybeArray, Role, Action } from './type'

/**
 * 类似于React Router的Switch组件，从Option中选取一个，忽略后续的Option
 * <Switch>
 *   <Switch.Option action={A}>one</Switch.Option>
 *   <Switch.Option action={[B, C]}>two</Switch.Option>
 *   <Switch.Option role={[RoleA, RoleB]}>three</Switch.Option>
 * </Switch>
 */
export default class Switch extends React.Component {
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
                role?: MaybeArray<Role>
                action?: MaybeArray<Action>
              }>(child)
            ) {
              // 合法组件
              if (child.props.action != null) {
                // 匹配权限
                const actions = child.props.action

                if (actions === '*') {
                  match = child
                  return
                }

                const normalized: Action[] = Array.isArray(actions)
                  ? actions
                  : [actions]
                if (allowsSome(...normalized)) {
                  match = child
                }
              } else if (child.props.role != null) {
                // 匹配角色
                const role = child.props.role
                const normalized = Array.isArray(role) ? role : [role]
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
