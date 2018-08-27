/**
 * FatTable 抽象常用的后台表格使用场景
 */
import React from 'react'
import Form from 'antd/lib/form'
import Query, { QueryGetter } from '../query'
import FatTableInner from './FatTable'
import { FatTableProps } from './type'
import { Actions, Action } from './components'
export * from './type'

export { QueryGetter, Actions, Action }

// FIXME: 避免使用any
const FatTableWithForm = Form.create()(FatTableInner as any)

export default class FatTable<T, P extends object> extends React.Component<
  FatTableProps<T, P> & {
    wrappedComponentRef?: React.Ref<FatTableProps<T, P>>
  }
> {
  public static Actions = Actions
  public static Action = Action
  public render() {
    return (
      <Query>
        {queryProps => <FatTableWithForm {...this.props} {...queryProps} />}
      </Query>
    )
  }
}
