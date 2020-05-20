/**
 * 企业搜索下拉列表
 */
import React from 'react'
import { TenementDesc, UserSelectContext } from './Provider'
import withProvider from './withProvider'
import SearchableSelect, {
  SearchableSelectProps,
} from './components/SearchableSelect'
import { Omit } from '../utils/type-utils'

export { TenementDesc }

export type CrossTenementSearchProps = Partial<
  Omit<SearchableSelectProps<TenementDesc>, 'onFetch' | 'notFoundContent'>
> & {
  extra?: any
}

interface Props extends CrossTenementSearchProps, UserSelectContext {}

export class CrossTenementSearch extends React.Component<Props, {}> {
  public static defaultProps = {
    placeholder: '搜索或选择跨组织企业',
  }

  public render() {
    const { selectStyle = { width: 485 } } = this.props
    return (
      <SearchableSelect
        {...this.props}
        selectStyle={selectStyle}
        onFetch={this.handleFetch}
        notFoundContent="未找到相关企业"
        formatter={this.formatter}
      />
    )
  }

  private formatter = (t: TenementDesc) =>
    this.props.formatter ? this.props.formatter(t) : t.name

  private handleFetch = (query: string, page: number, pageSize: number) => {
    if (this.props.searchCrossTenement == null) {
      throw new Error('[用户选择器]: 未提供跨组织企业搜索接口')
    }
    return this.props.searchCrossTenement(
      query,
      page,
      pageSize,
      this.props.extra,
    )
  }
}

export default withProvider(CrossTenementSearch)
