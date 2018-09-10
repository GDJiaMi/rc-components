/**
 * 部门选择器
 */
import React from 'react'
import { DepartmentDesc, TenementDesc } from './Provider'
import UserSelect, { UserSelectLocale, IUserSelect } from './UserSelect'

export { TenementDesc, DepartmentDesc }

export interface DepartmentSelectValue {
  departments?: DepartmentDesc[]
  tenements?: TenementDesc[]
}

export type DepartmentSelectLocale = UserSelectLocale

export interface DepartmentSelectProps {
  // 企业ID，如果为空则表示是平台
  tenementId?: string
  value?: DepartmentSelectValue
  onChange?: (value: DepartmentSelectValue) => void
  tenementSelectable?: boolean
  // 最多可选中部门
  max?: number | string
  // 最多可选企业
  maxTenement?: number | string
  // 部门节点选择完全受控，父子节点选中状态不再关联
  checkStrictly?: boolean
  // 保留value的值，不允许删除已有的数据
  keepValue?: boolean
  width?: number
  locale?: DepartmentSelectLocale
  tenementSearchPlaceholder?: string
  header?: React.ReactNode
  footer?: React.ReactNode
  wrappedComponentRef?: React.Ref<IUserSelect>
}

const DefaultLocale = {
  title: '选择部门',
}

export default class DepartmentSelect extends React.Component<
  DepartmentSelectProps,
  {}
> {
  public static defaultProps = {
    locale: {
      title: '选择部门',
    },
  }
  public render() {
    const { max, locale, ...other } = this.props
    return (
      <UserSelect
        maxDepartment={max}
        {...other}
        locale={{ ...DefaultLocale, ...(locale || {}) }}
        departmentSelectable
        userSelectable={false}
      />
    )
  }
}
