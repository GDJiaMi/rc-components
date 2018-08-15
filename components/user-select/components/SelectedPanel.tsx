/**
 * 已选状态区
 * TODO: 清空
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
    users: UserDesc[] | undefined,
    departments: DepartmentDesc[] | undefined,
    tenements: TenementDesc[] | undefined,
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
      <Group className="grow">
        <h3>
          已选择用户 ({users ? users.length : 0})
          <a>清空</a>
        </h3>
        <div className="tags">
          {!!users &&
            users.map(u =>
              this.renderTag(
                u.id,
                this.formatUser(u),
                'blue',
                this.handleClose('user', u),
              ),
            )}
        </div>
        {!!departmentSelectable && (
          <>
            <h3>
              已选择部门 ({departments ? departments.length : 0})
              <a>清空</a>
            </h3>
            <div className="tags">
              {!!departments &&
                departments.map(d =>
                  this.renderTag(
                    d.id,
                    this.formatDepartment(d),
                    'blue',
                    this.handleClose('department', d),
                  ),
                )}
            </div>
          </>
        )}
        {!!tenementSelectable && (
          <>
            <h3>
              已选择企业 ({tenements ? tenements.length : 0})
              <a>清空</a>
            </h3>
            <div className="tags">
              {!!tenements &&
                tenements.map(t =>
                  this.renderTag(
                    t.id,
                    this.formatTenement(t),
                    'blue',
                    this.handleClose('tenement', t),
                  ),
                )}
            </div>
          </>
        )}
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
      <Tag key={id} color={color} onClose={onClose}>
        {content}
      </Tag>
    )
  }

  private handleClose(type: 'user', value: UserDesc): Function
  private handleClose(type: 'department', value: DepartmentDesc): Function
  private handleClose(type: 'tenement', value: TenementDesc): Function
  private handleClose(type: string, value: any) {
    return () => {
      // TODO:
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
