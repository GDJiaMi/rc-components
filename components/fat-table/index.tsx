/**
 * FatTable 抽象常用的后台表格使用场景
 */
import React from 'react'
import Form from 'antd/lib/form'
import { ColumnProps } from 'antd/lib/table'
import Query, { QueryGetter } from '../query'
import FatTableInner from './FatTable'
import { FatTableProps } from './type'
export * from './type'

export { QueryGetter }

export type ColumnsType<T> = ColumnProps<T>[]

// FIXME: 避免使用any
const FatTableWithForm = Form.create()(FatTableInner as any)

export default function FatTable<T, P extends object>(
  props: FatTableProps<T, P> & {
    wrappedComponentRef?: React.Ref<FatTableProps<T, P>>
  },
) {
  return (
    <Query>
      {queryProps => <FatTableWithForm {...props} {...queryProps} />}
    </Query>
  )
}
