/**
 * FatTable 抽象常用的后台表格使用场景
 */
import React from 'react'
import Form from 'antd/es/form'
import Query, { QueryGetter } from '../query'
import FatTableInner from './FatTable'
import { FatTableProps } from './type'
import { Actions, Action, Nowrap, EmptyColumn } from './components'
import { DefaultPagination } from './constants'
import { IFatTable } from './type'
export * from './type'

export { QueryGetter, Actions, Action }

const FatTableWithForm = Form.create()(FatTableInner)

export default class FatTable<T, P extends object = {}> extends React.Component<
  FatTableProps<T, P> & {
    wrappedComponentRef?: React.Ref<IFatTable<T, P>>
  }
> {
  public static Actions = Actions
  public static Action = Action
  public static Nowrap = Nowrap
  public static DefaultPagination = DefaultPagination
  public static EmptyColumn = EmptyColumn
  public render() {
    return (
      <Query.Context.Consumer>
        {queryProps => (
          // @ts-ignore
          <FatTableWithForm {...this.props} search={queryProps} />
        )}
      </Query.Context.Consumer>
    )
  }
}
