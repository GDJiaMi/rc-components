/**
 * 已选状态区
 * TODO: 显示级联关系
 */
import React from 'react'
import Tag from 'antd/lib/tag'
import Group from './Group'
import { TenementDesc, DepartmentDesc, UserDesc } from '../Provider'

interface SelectedPanelProps {
  departmentSelectable?: boolean
  tenementSelectable?: boolean
  tenements?: TenementDesc[]
  departments?: DepartmentDesc[]
  users?: UserDesc[]
  onChange: (
    value: {
      users: UserDesc[] | undefined
      departments: DepartmentDesc[] | undefined
      tenements: TenementDesc[] | undefined
    },
  ) => void
  userFormatter?: (
    user: UserDesc,
    department?: DepartmentDesc,
    tenement?: TenementDesc,
  ) => string
  // 格式化已选中部门
  departmentFormatter?: (
    department: DepartmentDesc,
    tenement?: TenementDesc,
  ) => string
  tenementFormatter?: (tenement: TenementDesc) => string
}

export default class SelectedPanel extends React.PureComponent<
  SelectedPanelProps,
  {}
> {
  public render() {
    const {
      tenementSelectable,
      departmentSelectable,
      tenements,
      departments,
      users,
    } = this.props
    return (
      <Group className="grow selected">
        <div className="jm-us-container__body">
          <h3>
            已选择用户 ({users ? users.length : 0})
            <a onClick={this.handleCloseAll('users')}>清空</a>
          </h3>
          <div className="tags">
            {!!users &&
              users.map(u =>
                this.renderTag(
                  u.id,
                  this.formatUser(u),
                  'blue',
                  this.handleClose('users', u),
                ),
              )}
          </div>
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
                      d.id,
                      this.formatDepartment(d),
                      'blue',
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
                      t.id,
                      this.formatTenement(t),
                      'blue',
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
    id: string,
    content: string,
    color: string,
    onClose: Function,
  ) {
    return (
      <Tag key={id} color={color} onClose={onClose} title={content} closable>
        {content}
      </Tag>
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

  private formatUser(user: UserDesc) {
    return this.props.userFormatter
      ? this.props.userFormatter(user, user.department, user.tenement)
      : `${user.id}(${user.mobile})`
  }

  private formatDepartment(department: DepartmentDesc) {
    return this.props.departmentFormatter
      ? this.props.departmentFormatter(department, department.tenement)
      : department.name
  }

  private formatTenement(tenement: TenementDesc) {
    return this.props.tenementFormatter
      ? this.props.tenementFormatter(tenement)
      : tenement.name
  }
}
