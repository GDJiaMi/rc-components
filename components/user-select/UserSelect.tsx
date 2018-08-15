/**
 * 用户选择器
 * TODO: 处理disabled禁用状态
 */
import React from 'react'
import Modal from 'antd/lib/modal'
import Button from 'antd/lib/button'
import withProvider from './withProvider'
import { Adaptor, UserDesc, DepartmentDesc, TenementDesc } from './Provider'
import TenementSearch from './components/TenementSearchPanel'
import DepartemntTree from './components/DepartmentTree'
import UsersPanel from './components/UsersPanel'
import UserSearchPanel from './components/UserSearchPanel'
import SelectedPanel from './components/SelectedPanel'

export type UserSelectUsers = Array<{
  value: UserDesc
  // 是否禁用
  disabled?: boolean
}>

export type UserSelectDepartments = Array<{
  value: DepartmentDesc
  // 是否禁用
  disabled?: boolean
}>

export interface UserSelectValue {
  users: UserSelectUsers
  departments?: UserSelectDepartments
  tenements?: TenementDesc[]
}

export type UserSelectLocale = Partial<{
  title: string
  ok: string
  cancel: string
  // 提示文本
  tip: string
}>

export interface UserSelectProps {
  // 企业ID，如果为空则表示是平台
  tenementId?: string
  wrappedComponentRef?: React.Ref<UserSelectInner>
  value: UserSelectValue
  onChange: (value: UserSelectValue) => void
  // 是否可以选择部门
  departmentSelectable?: boolean
  // 是否可以选择企业
  tenementSelectable?: boolean
  // 用户是支持搜索
  userSearchable?: boolean
  // 最多可选中用户
  max?: number
  // 最多可选中部门
  maxDepartment?: number
  // 文案
  locale?: UserSelectLocale
  // 格式化已选中用户，department是可选的，在选中搜索用户时可能为空
  userFormatter?: (user: UserDesc) => string
  // 格式化已选中部门
  departmentFormatter?: (department: DepartmentDesc) => string
  tenementFormatter?: (tenement: TenementDesc) => string
}

interface Props extends UserSelectProps, Adaptor {}

interface State {
  visible: boolean
  currentTenementId?: string
  currentTenement?: TenementDesc
  selectedTenements?: TenementDesc[]
  currentDepartmentId?: string
  currentDepartment?: DepartmentDesc
  selectedDepartments?: DepartmentDesc[]
  selectedUsers?: UserDesc[]
}

const DefaultLocale: UserSelectLocale = {
  title: '用户选择',
  ok: '确定',
  cancel: '取消',
  tip: '',
}

class UserSelectInner extends React.Component<Props, State> {
  public static defaultProps = {}
  public state: State = {
    visible: false,
    currentTenementId: this.props.tenementId,
  }

  private get tenementSelectable(): boolean {
    return this.props.tenementId == null && this.tenementSelectable
  }

  private get tenementVisible(): boolean {
    return this.props.tenementId == null
  }

  private get departmentSelectable(): boolean {
    return !!this.props.departmentSelectable
  }

  public render() {
    const { visible } = this.state
    return (
      <Modal
        visible={visible}
        title={this.getLocale('title')}
        width={825}
        maskClosable={false}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        footer={this.renderFooter()}
      >
        {this.renderBody()}
      </Modal>
    )
  }

  public show() {
    this.setState({ visible: true })
  }

  private renderBody() {
    const { tenementSelectable, tenementVisible, departmentSelectable } = this
    const { userSearchable } = this.props
    const {
      currentTenementId,
      currentTenement,
      currentDepartmentId,
      selectedTenements,
      currentDepartment,
      selectedDepartments,
      selectedUsers,
    } = this.state
    return (
      <div className="jm-us">
        {!!tenementVisible && (
          <TenementSearch
            // 企业选择器
            selectable={tenementSelectable}
            value={selectedTenements}
            onChange={this.handleTenementChange}
            selected={currentTenementId}
            onSelect={this.handleTenementSelect}
          />
        )}
        <UserSearchPanel
          tenementId={currentTenementId}
          searchable={userSearchable}
          value={selectedUsers}
          onChange={this.handleUsersChange}
        >
          <DepartemntTree
            // 部门树
            tenementId={currentTenementId}
            tenement={currentTenement}
            selectable={departmentSelectable}
            selected={currentDepartmentId}
            onSelect={this.handleDepartmentSelect}
            value={selectedDepartments}
            onChange={this.handleDepartmentChange}
          />
          <UsersPanel
            tenementId={currentTenementId}
            departmentId={currentDepartmentId}
            department={currentDepartment}
            value={selectedUsers}
            onChange={this.handleUsersChange}
          />
        </UserSearchPanel>
        <SelectedPanel
          tenementSelectable={tenementSelectable}
          departmentSelectable={departmentSelectable}
          tenements={selectedTenements}
          departments={selectedDepartments}
          users={selectedUsers}
          onChange={this.handleSelectedChange}
        />
      </div>
    )
  }

  private renderFooter = () => {
    const tip = this.getLocale('tip')
    const cancelText = this.getLocale('cancel')
    const okText = this.getLocale('ok')
    return (
      <div>
        {!!tip && <div className="jh-us-tip">{tip}</div>}
        <Button onClick={this.handleCancel}>{cancelText}</Button>
        <Button onClick={this.handleOk} type="primary">
          {okText}
        </Button>
      </div>
    )
  }

  private handleTenementChange = (tenements: TenementDesc[]) => {
    this.setState({
      selectedTenements: tenements,
    })
  }

  private handleTenementSelect = (
    tenementId: string,
    tenement: TenementDesc,
  ) => {
    this.setState({
      currentTenementId: tenementId,
      currentTenement: tenement,
    })
  }

  private handleDepartmentChange = (departments: DepartmentDesc[]) => {
    this.setState({
      selectedDepartments: departments,
    })
  }

  private handleDepartmentSelect = (
    departmentId: string,
    detail?: DepartmentDesc,
  ) => {
    this.setState({
      currentDepartmentId: departmentId,
      currentDepartment: detail,
    })
  }

  private handleUsersChange = (users: UserDesc[]) => {
    this.setState({
      selectedUsers: users,
    })
  }

  private handleSelectedChange = (
    users: UserDesc[] | undefined,
    departments: DepartmentDesc[] | undefined,
    tenements: TenementDesc[] | undefined,
  ) => {
    this.handleUsersChange(users || [])
    this.handleDepartmentChange(departments || [])
    this.handleTenementChange(tenements || [])
  }

  private handleCancel = () => {
    this.setState({ visible: false }, () => {
      this.reset()
    })
  }

  private handleOk = () => {
    // TODO:
    // this.props.onChange()
    this.reset()
  }

  private reset = () => {
    // TODO: 重置状态
  }

  private getLocale(key: keyof UserSelectLocale) {
    return (this.props.locale || DefaultLocale)[key] || ''
  }
}

export default withProvider(UserSelectInner)
