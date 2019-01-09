import React from 'react'
import { Omit } from 'utils/type-utils'
import { QueryContext, QueryComponentProps } from './Provider'

/**
 * 高阶组件，注入query对象
 */
export default function withQuery<P extends QueryComponentProps>(
  Component: React.ComponentType<P>,
): React.ComponentClass<Omit<P, keyof QueryComponentProps>> {
  return class extends React.Component<Omit<P, keyof QueryComponentProps>> {
    public render() {
      return (
        <QueryContext.Consumer>
          {props => (
            // @ts-ignore
            <Component search={props} {...this.props} />
          )}
        </QueryContext.Consumer>
      )
    }
  }
}
