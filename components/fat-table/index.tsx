/**
 * FatTable 抽象常用的后台表格使用场景
 */
import React from 'react'
import Form from 'antd/lib/form'
import Query, { QueryGetter } from '../query'
import FatTableInner from './FatTable'
import { FatTableProps } from './type'
import { Actions, Action, Nowrap } from './components'
import { DefaultPagination } from './constants'
import { IFatTable } from './type'
export * from './type'

export { QueryGetter, Actions, Action }

// FIXME: 避免使用any
const FatTableWithForm = Form.create()(FatTableInner as any)

export default class FatTable<T, P extends object> extends React.Component<
  FatTableProps<T, P> & {
    wrappedComponentRef?: React.Ref<IFatTable<T, P>>
  }
> {
  public static Actions = Actions
  public static Action = Action
  public static Nowrap = Nowrap
  public static DefaultPagination = DefaultPagination
  public render() {
    return (
      <Query>
        {queryProps => <FatTableWithForm {...this.props} {...queryProps} />}
      </Query>
    )
  }
}
