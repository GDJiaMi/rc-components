import React from 'react'
import { Adaptor, Context } from './Provider'
import { Omit } from 'react-router'

export default function withProvider<P extends Adaptor>(
  Target: React.ComponentClass<P>,
) {
  class withUserSelect extends React.Component<
    {
      wrappedComponentRef?: React.Ref<any>
    } & Omit<P, keyof Adaptor>
  > {
    static displayName: string = `InjectUserSelectAdaptor(${Target.name ||
      'Unknown'})`
    public render() {
      return (
        <Context.Consumer>
          {props => {
            // @ts-ignore
            const { wrappedComponentRef, ...other } = this.props
            return <Target {...props} {...other} ref={wrappedComponentRef} />
          }}
        </Context.Consumer>
      )
    }
  }
  return withUserSelect
}
