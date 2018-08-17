/**
 * 已选状态区
 */
import React from 'react'
import Tag from 'antd/lib/tag'
import Popover from 'antd/lib/popover'
import Group from './Group'
import { TenementDesc, DepartmentDesc, UserDesc } from '../Provider'

export interface SelectedPanelValue {
  users?: UserDesc[]
  departments?: DepartmentDesc[]
  tenements?: TenementDesc[]
}

export type SelectedPanelFormatter = Partial<{
  userLabel: (user: UserDesc) => string
  userTip: (user: UserDesc) => string
  departmentLabel: (department: DepartmentDesc) => string
  departmentTip: (department: DepartmentDesc) => string
  tenementLabel: (tenement: TenementDesc) => string
  tenementTip: (tenement: TenementDesc) => string
}>

export interface SelectedPanelProps {
  departmentSelectable?: boolean
  tenementSelectable?: boolean
  userSelectable?: boolean
  tenements?: TenementDesc[]
  departments?: DepartmentDesc[]
  users?: UserDesc[]
  keepValue?: boolean
  orgValue?: SelectedPanelValue
  onChange: (value: SelectedPanelValue) => void
  formatter?: SelectedPanelFormatter
}

export default class SelectedPanel extends React.PureComponent<
  SelectedPanelProps,
  {}
> {
  public render() {
    const {
      tenementSelectable,
      departmentSelectable,
      userSelectable,
      tenements,
      departments,
      users,
    } = this.props
    return (
      <Group className="grow selected">
        <div className="jm-us-container__body">
          {!!userSelectable && (
            <>
              <h3>
                已选择用户 ({users ? users.length : 0})
                <a onClick={this.handleCloseAll('users')}>清空</a>
              </h3>
              <div className="tags">
                {!!users &&
                  users.map(u =>
                    this.renderTag(
                      'users',
                      u.id,
                      this.format('user', u),
                      this.handleClose('users', u),
                    ),
                  )}
              </div>
            </>
          )}
          {!!departmentSelectable && (
            <>
              <h3>
                已选择部门 ({departments ? departments.length : 0})
                <a onClick={this.handleCloseAll('departments')}>清空</a>
              </h3>
              <div className="tags">
                {!!departments &&
                  departments.map(d =>
                    this.renderTag(
                      'departments',
                      d.id,
                      this.format('department', d),
                      this.handleClose('departments', d),
                    ),
                  )}
              </div>
            </>
          )}
          {!!tenementSelectable && (
            <>
              <h3>
                已选择企业 ({tenements ? tenements.length : 0})
                <a onClick={this.handleCloseAll('tenements')}>清空</a>
              </h3>
              <div className="tags">
                {!!tenements &&
                  tenements.map(t =>
                    this.renderTag(
                      'tenements',
                      t.id,
                      this.format('tenement', t),
                      this.handleClose('tenements', t),
                    ),
                  )}
              </div>
            </>
          )}
        </div>
      </Group>
    )
  }

  private renderTag(
    type: 'users' | 'departments' | 'tenements',
    id: string,
    content: [string, string], // content, tip
    onClose: Function,
  ) {
    const { keepValue, orgValue } = this.props
    const value = orgValue && orgValue[type]
    const disabled =
      keepValue &&
      value &&
      (value as Array<{ id: string }>).findIndex(i => i.id === id) !== -1
    const [label, tip] = content
    return (
      <Popover content={tip} key={id} placement="right">
        <Tag color="blue" onClose={onClose} title={label} closable={!disabled}>
          {label}
        </Tag>
      </Popover>
    )
  }

  private handleClose(type: 'users', value: UserDesc): Function
  private handleClose(type: 'departments', value: DepartmentDesc): Function
  private handleClose(type: 'tenements', value: TenementDesc): Function
  private handleClose(
    type: 'users' | 'departments' | 'tenements',
    value: UserDesc | DepartmentDesc | TenementDesc,
  ) {
    return () => {
      const list = [...(this.props[type] || [])]
      const index = list.findIndex(i => i.id === value.id)
      if (index !== -1) {
        const { users, tenements, departments } = this.props
        list.splice(index, 1)
        this.props.onChange({
          users,
          tenements,
          departments,
          [type]: list,
        })
      }
    }
  }

  private handleCloseAll(type: 'users' | 'departments' | 'tenements') {
    return () => {
      const list = [...(this.props[type] || [])]
      if (list == null || list.length === 0) {
        return
      }
      const { users, tenements, departments } = this.props
      this.props.onChange({
        users,
        tenements,
        departments,
        [type]: [],
      })
    }
  }

  private formatDepartment(d: DepartmentDesc) {
    return `${d.tenement ? d.tenement.name + ' > ' : ''}${d.name}`
  }

  private formatUser(u: UserDesc) {
    return `${u.department ? this.formatDepartment(u.department) + ' > ' : ''}${
      u.name
    }`
  }

  private format(
    type: 'user' | 'department' | 'tenement',
    value: UserDesc | DepartmentDesc | TenementDesc,
  ): [string, string] {
    const defaultLabel = value.name
    const defaultTip: string =
      type === 'department'
        ? this.formatDepartment(value)
        : type === 'user'
          ? this.formatUser(value as UserDesc)
          : defaultLabel

    if (this.props.formatter) {
      const labelFormatter = this.props.formatter[type + 'Label']
      const tipFormatter = this.props.formatter[type + 'Tip']
      return [
        labelFormatter ? labelFormatter(value) : defaultLabel,
        tipFormatter ? tipFormatter(value) : defaultTip,
      ]
    }
    return [defaultLabel, defaultTip]
  }
}
