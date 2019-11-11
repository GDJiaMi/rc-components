import React from 'react'
import { Context, UserSelectContext } from './Provider'
import { Omit } from 'react-router'

export default function withProvider<P extends UserSelectContext>(
  Target: React.ComponentClass<P>,
) {
  return class withUserSelect extends React.Component<
    {
      wrappedComponentRef?: React.Ref<any>
    } & Omit<P, keyof UserSelectContext>
  > {
    static displayName: string = `InjectUserSelectAdaptor(${Target.name ||
      'Unknown'})`
    public render() {
      return (
        <Context.Consumer>
          {props => {
            const { wrappedComponentRef, ...other } = this.props
            // @ts-ignore
            return <Target {...props} {...other} ref={wrappedComponentRef} />
          }}
        </Context.Consumer>
      )
    }
  }
}
