import React from 'react'
import { Adaptor, Context } from './Provider'
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export default function withProvider<P extends Adaptor>(
  Target: React.ComponentClass<P>,
) {
  class withUserSelect extends React.Component<
    {
      wrappedComponentRef?: React.Ref<typeof Target>
    } & Omit<P, keyof Adaptor>
  > {
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
