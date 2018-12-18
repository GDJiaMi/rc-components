import React from 'react'
import { Action, Role } from './type'

export type ChooseOptionProps =
  | {
      action: Action | Action[]
    }
  | {
      role: Role | Role[]
    }

export default class Option extends React.PureComponent<ChooseOptionProps> {
  public render() {
    return this.props.children
  }
}
