/**
 * 企业搜索下拉列表
 */
import React from 'react'
import { Adaptor, TenementDesc } from './Provider'
import withProvider from './withProvider'
import SearchableSelect, {
  SearchableSelectProps,
} from './components/SearchableSelect'
import { Omit } from '../utils/type-utils'

export { TenementDesc }

export type TenementSearchProps = Partial<
  Omit<SearchableSelectProps<TenementDesc>, 'onFetch' | 'notFoundContent'>
> & {
  extra?: any
}

interface Props extends TenementSearchProps, Adaptor {}

export class TenementSearch extends React.Component<Props, {}> {
  public static defaultProps = {
    placeholder: '搜索或选择企业',
  }

  public render() {
    const {} = this.props
    return (
      <SearchableSelect
        {...this.props}
        onFetch={this.handleFetch}
        notFoundContent="未找到相关企业"
        formatter={this.formatter}
      />
    )
  }

  private formatter = (t: TenementDesc) =>
    this.props.formatter ? this.props.formatter(t) : t.name

  private handleFetch = (query: string, page: number, pageSize: number) =>
    this.props.searchTenement(query, page, pageSize, this.props.extra)
}

export default withProvider(TenementSearch)
