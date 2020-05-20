/**
 * 用户选择器
 * TODO: 性能优化
 */
import React from 'react'
import Modal from 'antd/es/modal'
import Button from 'antd/es/button'
import Tabs from 'antd/es/tabs'
import memoize from 'lodash/memoize'
import withProvider from './withProvider'
import {
  UserDesc,
  DepartmentDesc,
  TenementDesc,
  UserSelectContext,
  UserGroupDesc,
} from './Provider'
import TenementSearch from './components/TenementSearchPanel'
import DepartmentTree from './components/DepartmentTree'
import UsersPanel from './components/UsersPanel'
import UserGroupMemberPanel from './components/UserGroupMemberPanel'
import UserSearchPanel from './components/UserSearchPanel'
import SelectedPanel, {
  SelectedPanelFormatter,
  SelectedPanelValue,
} from './components/SelectedPanel'
import UserGroupTree from './components/UserGroupTree'

export interface IUserSelect {
  show(): void
}

export type UserSelectValue = SelectedPanelValue

export type UserSelectLocale = Partial<{
  title: string
  ok: string
  cancel: string
  // 提示文本
  tip: string
}>

export type UserSelectFormatter = SelectedPanelFormatter

export interface UserSelectProps {
  // 企业ID，如果为空则表示是平台
  tenementId?: string
  value?: UserSelectValue
  onChange?: (value: UserSelectValue) => void
  // 是否可以选择部门, 默认关闭
  departmentSelectable?: boolean
  // 是否可以选择企业, 默认关闭
  tenementSelectable?: boolean
  // 是否可以选择用户
  userSelectable?: boolean
  // 用户是支持搜索, 默认开启
  userSearchable?: boolean
  // 部门是否支持搜索, 默认开启
  departmentSearchable?: boolean
  // 部门节点选择完全受控，父子节点选中状态不再关联
  checkStrictly?: boolean
  // 只允许选择叶子节点
  onlyAllowCheckLeaf?: boolean

  // 用户组, 默认关闭
  userGroupEnable?: boolean
  // 用户组是否可以选择, 默认关闭
  userGroupSelectable?: boolean
  // 用户组成员是否可以选择, 默认关闭
  userGroupMemberSelectable?: boolean

  // 跨组织架构, 默认关闭
  crossTenementEnable?: boolean

  // 最多可选中用户, 默认不限制
  max?: number | string
  // 最多可选中部门
  maxDepartment?: number | string
  // 最多可选企业
  maxTenement?: number | string
  // 最多可选用户组
  maxUserGroup?: number | string
  // 保留value的值，不允许删除已有的数据
  keepValue?: boolean
  width?: number
  // 文案
  locale?: UserSelectLocale
  // 格式化已选
  formatter?: UserSelectFormatter
  header?: React.ReactNode
  footer?: React.ReactNode

  // 其他，极为少用的定制化
  tenementSearchPlaceholder?: string
  userSearchPlaceholder?: string
  crossTenementSearchPlaceholder?: string

  childrenUncheckable?: boolean
  renderUserItem?: (item: UserDesc) => React.ReactNode
  renderUserSearchItem?: (item: UserDesc) => React.ReactNode
  extra?: any
}

interface Props extends UserSelectProps, UserSelectContext {}

type ITab = 'department' | 'usergroup'

interface State {
  visible: boolean
  normalizing?: boolean
  // 当前选中
  currentTab: ITab
  currentTenementId?: string
  currentTenement?: TenementDesc
  currentDepartmentId?: string
  currentDepartment?: DepartmentDesc
  currentUserGroupId?: string
  currentUserGroup?: UserGroupDesc
  // 已 checked
  selectedTenements?: TenementDesc[]
  selectedDepartments?: DepartmentDesc[]
  selectedUsers?: UserDesc[]
  selectedUserGroups?: UserGroupDesc[]
}

interface Closable {
  reset(): void
}

const DefaultLocale: UserSelectLocale = {
  title: '用户选择',
  ok: '确定',
  cancel: '取消',
  tip: '',
}

class UserSelectInner extends React.Component<Props, State>
  implements IUserSelect {
  public static defaultProps = {
    userSearchable: true,
    userSelectable: true,
    departmentSearchable: true,
  }
  public state: State = {
    visible: false,
    currentTenementId: this.props.tenementId,
    currentTab: 'department',
  }

  private tenementSearchPanel = React.createRef<Closable>()
  private userSearchPanel = React.createRef<Closable>()

  private get tenementVisible(): boolean {
    return this.props.tenementId == null
  }

  private get tenementSelectable(): boolean {
    return !!this.props.tenementSelectable && this.tenementVisible
  }

  private get departmentSelectable(): boolean {
    return !!this.props.departmentSelectable
  }

  private get width(): number {
    return this.props.width || this.tenementVisible ? 1050 : 888
  }

  public shouldComponentUpdate(nextProps: Props, nextState: State) {
    if (!this.state.visible && !nextState.visible) {
      return false
    }
    return true
  }

  public componentDidUpdate(prevProps: Props, prevState: State) {
    // 从隐藏到显示
    if (this.state.visible && !prevState.visible) {
      // 同步状态
      const derivedState: Partial<State> = {}
      let dirty = false
      const value = this.props.value || {}

      if (this.props.tenementId !== this.state.currentTenementId) {
        dirty = true
        derivedState.currentTenementId = this.props.tenementId
      }

      if (!arrayEqual(value.users, this.state.selectedUsers)) {
        dirty = true
        derivedState.selectedUsers = value.users
      }

      if (!arrayEqual(value.departments, this.state.selectedDepartments)) {
        dirty = true
        derivedState.selectedDepartments = value.departments
      }

      if (!arrayEqual(value.tenements, this.state.selectedTenements)) {
        dirty = true
        derivedState.selectedTenements = value.tenements
      }

      if (!arrayEqual(value.userGroups, this.state.selectedUserGroups)) {
        dirty = true
        derivedState.selectedUserGroups = value.userGroups
      }

      if (dirty) {
        this.setState(derivedState as State)
      }
    }
  }

  public render() {
    const { visible } = this.state
    return (
      <Modal
        visible={visible}
        title={this.getLocale('title')}
        width={this.width}
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

  public resetCache() {
    this.props.resetCache()
  }

  private renderBody() {
    const { tenementSelectable, tenementVisible, departmentSelectable } = this
    const {
      userSearchable,
      departmentSearchable,
      keepValue,
      tenementSearchPlaceholder,
      userSelectable,
      userGroupMemberSelectable,
      checkStrictly,
      onlyAllowCheckLeaf,
      userSearchPlaceholder,
      renderUserSearchItem,
      renderUserItem,
      childrenUncheckable,
      userGroupEnable,
      userGroupSelectable,
      crossTenementEnable,
      crossTenementSearchPlaceholder,
      extra,
    } = this.props
    const {
      currentTab,
      currentTenementId,
      currentTenement,
      currentDepartmentId,
      currentDepartment,
      currentUserGroupId,
      currentUserGroup,
      selectedTenements,
      selectedDepartments,
      selectedUsers,
      selectedUserGroups,
      normalizing,
    } = this.state

    const depTree = (
      <DepartmentTree
        // 部门树
        checkStrictly={checkStrictly}
        tenementId={currentTenementId}
        tenement={currentTenement}
        selectable={departmentSelectable}
        searchable={departmentSearchable}
        onlyAllowCheckLeaf={onlyAllowCheckLeaf}
        selected={currentDepartmentId}
        onSelect={this.handleDepartmentSelect}
        value={selectedDepartments}
        onChange={this.handleDepartmentChange}
        keepValue={keepValue}
        orgValue={this.props.value && this.props.value.departments}
        onNormalizeStart={this.handleNormalizeStart}
        onNormalizeEnd={this.handleNormalizeEnd}
        childrenUncheckable={childrenUncheckable}
        extra={extra}
      />
    )

    return (
      <div className="jm-us">
        {!!tenementVisible && (
          <TenementSearch
            // 企业选择器
            selectable={tenementSelectable}
            orgValue={this.props.value && this.props.value.tenements}
            value={selectedTenements}
            onChange={this.handleTenementChange}
            selected={currentTenementId}
            keepValue={keepValue}
            onSelect={this.handleTenementSelect}
            wrappedComponentRef={this.tenementSearchPanel}
            placeholder={tenementSearchPlaceholder}
            normalizing={normalizing}
            extra={extra}
          />
        )}
        <UserSearchPanel
          tenementId={currentTenementId}
          platformSearch={this.tenementVisible}
          searchable={userSearchable && userSelectable}
          value={selectedUsers}
          onChange={this.handleUsersChange}
          wrappedComponentRef={this.userSearchPanel}
          keepValue={keepValue}
          orgValue={this.props.value && this.props.value.users}
          header={this.props.header}
          placeholder={userSearchPlaceholder}
          renderItem={renderUserSearchItem || renderUserItem}
          crossTenementEnable={crossTenementEnable}
          crossTenementSearchPlaceholder={crossTenementSearchPlaceholder}
          onSelect={this.handleTenementSelect}
          extra={extra}
        >
          <div className="jm-us-containers">
            <div className="jm-us-container">
              {userGroupEnable ? (
                <Tabs
                  activeKey={currentTab}
                  onChange={this.handleTabChange}
                  size="small"
                >
                  <Tabs.TabPane tab="组织架构" key="department">
                    {depTree}
                  </Tabs.TabPane>
                  <Tabs.TabPane tab="用户组" key="usergroup">
                    <UserGroupTree
                      tenementId={currentTenementId}
                      tenement={currentTenement}
                      selectable={userGroupSelectable}
                      onSelect={this.handleUserGroupSelect}
                      selected={currentUserGroupId}
                      value={selectedUserGroups}
                      onChange={this.handleUserGroupChange}
                      extra={extra}
                    />
                  </Tabs.TabPane>
                </Tabs>
              ) : (
                depTree
              )}
            </div>

            <div className="jm-us-container">
              {!!userSelectable && currentTab === 'department' && (
                <UsersPanel
                  tenementId={currentTenementId}
                  departmentId={currentDepartmentId}
                  department={currentDepartment}
                  value={selectedUsers}
                  onChange={this.handleUsersChange}
                  keepValue={keepValue}
                  renderItem={renderUserItem}
                  orgValue={this.props.value && this.props.value.users}
                  extra={extra}
                />
              )}
              {!!userGroupMemberSelectable && currentTab === 'usergroup' && (
                <UserGroupMemberPanel
                  tenementId={currentTenementId}
                  group={currentUserGroup}
                  groupId={currentUserGroupId}
                  value={selectedUsers}
                  onChange={this.handleUsersChange}
                  renderItem={renderUserItem}
                  extra={extra}
                />
              )}
            </div>
          </div>
        </UserSearchPanel>
        <SelectedPanel
          tenementSelectable={tenementSelectable}
          departmentSelectable={departmentSelectable}
          userGroupSelectable={userGroupSelectable}
          userSelectable={userSelectable}
          keepValue={keepValue}
          orgValue={this.props.value}
          tenements={selectedTenements}
          departments={selectedDepartments}
          userGroups={selectedUserGroups}
          users={selectedUsers}
          onChange={this.handleSelectedChange}
          formatter={this.props.formatter}
        />
      </div>
    )
  }

  private renderFooter = () => {
    const { normalizing } = this.state
    const tip = this.getLocale('tip')
    const cancelText = this.getLocale('cancel')
    const okText = this.getLocale('ok')

    return (
      <div className="jm-us-footer">
        <div>
          {this.props.footer}
          {!!tip && <div className="jh-us-tip">{tip}</div>}
        </div>
        <div className="buttons">
          <Button onClick={this.handleCancel}>{cancelText}</Button>
          <Button onClick={this.handleOk} type="primary" loading={normalizing}>
            {okText}
          </Button>
        </div>
      </div>
    )
  }

  private handleNormalizeStart = () => {
    this.setState({ normalizing: true })
  }

  private handleNormalizeEnd = () => {
    this.setState({ normalizing: false })
  }

  private handleTabChange = (active: string) => {
    this.setState({ currentTab: active as ITab })
  }

  private handleTenementChange = (tenements: TenementDesc[]) => {
    if (
      this.canSet(
        this.props.maxTenement,
        tenements,
        this.state.selectedTenements,
      )
    ) {
      this.setState({
        selectedTenements: tenements,
      })
    }
  }

  private handleTenementSelect = (
    tenementId: string,
    tenement: TenementDesc,
  ) => {
    this.setState({
      currentTenementId: tenementId,
      currentTenement: tenement,
      currentDepartmentId: undefined,
      currentDepartment: undefined,
    })
  }

  private handleDepartmentChange = (departments: DepartmentDesc[]) => {
    if (
      this.canSet(
        this.props.maxDepartment,
        departments,
        this.state.selectedDepartments,
      )
    ) {
      this.setState({
        selectedDepartments: departments,
      })
    }
  }

  private handleUserGroupChange = (userGroups: UserGroupDesc[]) => {
    if (
      this.canSet(
        this.props.maxUserGroup,
        userGroups,
        this.state.selectedUserGroups,
      )
    ) {
      this.setState({
        selectedUserGroups: userGroups,
      })
    }
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

  private handleUserGroupSelect = (id: string, item: UserGroupDesc) => {
    this.setState({
      currentUserGroupId: id,
      currentUserGroup: item,
    })
  }

  private handleUsersChange = (users: UserDesc[]) => {
    if (this.canSet(this.props.max, users, this.state.selectedUsers)) {
      this.setState({
        selectedUsers: users,
      })
    }
  }

  private handleSelectedChange = ({
    users,
    departments,
    tenements,
    userGroups,
  }: UserSelectValue) => {
    this.handleUsersChange(users || [])
    this.handleDepartmentChange(departments || [])
    this.handleTenementChange(tenements || [])
    this.handleUserGroupChange(userGroups || [])
  }

  private handleCancel = () => {
    this.reset()
  }

  private handleOk = () => {
    if (this.props.onChange) {
      const {
        selectedUsers,
        selectedDepartments,
        selectedTenements,
        selectedUserGroups,
      } = this.state
      this.props.onChange({
        users: selectedUsers || [],
        departments: selectedDepartments || [],
        tenements: selectedTenements || [],
        userGroups: selectedUserGroups || [],
      })
    }

    this.reset()
  }

  /**
   * 模态框关闭后重置状态
   */
  private reset = () => {
    this.setState(
      {
        visible: false,
        currentTab: 'department',
        currentTenementId: undefined,
        currentTenement: undefined,
        currentDepartmentId: undefined,
        currentDepartment: undefined,
        currentUserGroup: undefined,
        currentUserGroupId: undefined,
      },
      () => {
        if (this.tenementSearchPanel.current) {
          this.tenementSearchPanel.current.reset()
        }
        this.userSearchPanel.current!.reset()
      },
    )
  }

  private getLocale(key: keyof UserSelectLocale) {
    return (this.props.locale || DefaultLocale)[key] || DefaultLocale[key]
  }

  private canSet<T>(
    max: number | string | undefined,
    newValue: T[],
    oldValue?: T[],
  ) {
    return (
      this.getMax(max) >= newValue.length ||
      newValue.length < (oldValue ? oldValue.length : 0)
    )
  }

  private getMax = memoize((value?: string | number) => {
    return value == null
      ? Infinity
      : typeof value === 'number'
      ? value
      : parseInt(value)
  })
}

function arrayEqual<T>(a1: T[] | undefined, a2: T[] | undefined) {
  if (a1 == a2) {
    return true
  }

  if (a1 != null && a2 != null) {
    if (a1.length != a2.length) {
      return false
    }

    for (const i of a1) {
      for (const j of a2) {
        if (i !== j) {
          return false
        }
      }
    }
    return true
  }
  return false
}

export default withProvider(UserSelectInner)
