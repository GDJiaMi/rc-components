import React from 'react'
import { Omit } from 'utils/type-utils'
import Query, { QueryComponentProps } from './Query'

export default function withQuery<P extends QueryComponentProps>(
  Component: React.ComponentType<P>,
): React.ComponentClass<Omit<P, keyof QueryComponentProps>> {
  return class extends React.Component<Omit<P, keyof QueryComponentProps>> {
    public render() {
      // @ts-ignore
      return <Query>{props => <Component {...props} {...this.props} />}</Query>
    }
  }
}
