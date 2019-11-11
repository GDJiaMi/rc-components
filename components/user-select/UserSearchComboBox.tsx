/**
 * 用户搜索ComboBox
 */
import React from 'react'
import { UserDesc, UserSelectContext } from './Provider'
import withProvider from './withProvider'
import ComboBox, { ComboBoxProps } from './components/ComboBox'
import { Omit } from '../utils/type-utils'

export { UserDesc }

export type UserSearchComboBoxProps = Partial<
  Omit<ComboBoxProps<UserDesc>, 'onFetch'>
> & {
  tenementId?: string
  extra?: any
}
interface Props extends UserSearchComboBoxProps, UserSelectContext {}

export class UserSearchComboBox extends React.Component<Props, {}> {
  public static defaultProps = {
    placeholder: '搜索或选择用户',
  }

  public render() {
    return (
      <ComboBox
        {...this.props}
        onFetch={this.handleFetch}
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

export default withProvider(UserSearchComboBox)
