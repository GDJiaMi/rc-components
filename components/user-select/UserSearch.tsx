/**
 * 用户搜索下拉列表
 */
import React from 'react'
import { UserDesc, UserSelectContext } from './Provider'
import withProvider from './withProvider'
import SearchableSelect, {
  SearchableSelectProps,
} from './components/SearchableSelect'
import { Omit } from '../utils/type-utils'

export { UserDesc }

export type UserSearchProps = Partial<
  Omit<SearchableSelectProps<UserDesc>, 'onFetch' | 'notFoundContent'>
> & {
  tenementId?: string
  extra?: any
}
interface Props extends UserSearchProps, UserSelectContext {}

export class UserSearch extends React.Component<Props, {}> {
  public static defaultProps = {
    placeholder: '搜索或选择用户',
  }

  public render() {
    const {} = this.props
    return (
      <SearchableSelect
        {...this.props}
        onFetch={this.handleFetch}
        notFoundContent="未找到相关用户"
        formatter={this.formatter}
      />
    )
  }

  private formatter = (t: UserDesc) =>
    this.props.formatter
      ? this.props.formatter(t)
      : this.props.userFormatter
      ? this.props.userFormatter(t, this.props.extra)
      : `${t.name}(${t.mobile || t.id})`

  private handleFetch = (query: string, page: number, pageSize: number) =>
    this.props.searchUser(
      query,
      page,
      pageSize,
      this.props.tenementId,
      this.props.extra,
    )
}

export default withProvider(UserSearch)
