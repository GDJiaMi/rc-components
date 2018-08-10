/**
 * 用户选择器
 */
import React from 'react'
import { Context, Adaptor } from './Provider'

export interface UserSelectProps {
  // 企业ID，如果为空则表示是平台
  tenementId?: string
  wrappedComponentRef?: React.Ref<UserSelectInner>
}

interface Props extends UserSelectProps, Adaptor {}

class UserSelectInner extends React.Component<Props> {
  public render() {
    return <div>hello world</div>
  }
}

export default class UserSelect extends React.Component<UserSelectProps> {
  public render() {
    return (
      <Context.Consumer>
        {props => {
          const { wrappedComponentRef, ...other } = this.props
          return (
            <UserSelectInner {...props} {...other} ref={wrappedComponentRef} />
          )
        }}
      </Context.Consumer>
    )
  }
}
