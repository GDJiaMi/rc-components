/**
 * 用户选择器
 * TODO: 处理disabled禁用状态
 * TODO: 最多选择限制
 * TODO: 性能优化
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
import SelectedPanel, {
  SelectedPanelFormatter,
} from './components/SelectedPanel'

export interface IUserSelect {
  show(): void
}

export interface UserSelectValue {
  users?: UserDesc[]
  departments?: DepartmentDesc[]
  tenements?: TenementDesc[]
}

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
  // 最多可选企业
  maxTenement?: number
  width?: number
  // 文案
  locale?: UserSelectLocale
  // 格式化已选
  formatter?: UserSelectFormatter
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
    width: 1000,
    userSearchable: true,
  }
  public state: State = {
    visible: false,
    currentTenementId: this.props.tenementId,
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

  public shouldComponentUpdate(nextProps: Props, nextState: State) {
    if (!this.state.visible && !nextState.visible) {
      return false
    }
    // TODO: 严格
    return true
  }

  public componentDidUpdate(prevProps: Props, prevState: State) {
    // 从隐藏到显示
    if (this.state.visible && !prevState.visible) {
      // 同步状态
      const derivedState: Partial<State> = {}
      let dirty = false
      const value = this.props.value || {}
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
        width={this.props.width}
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
            wrappedComponentRef={this.tenementSearchPanel}
          />
        )}
        <UserSearchPanel
          tenementId={currentTenementId}
          searchable={userSearchable}
          value={selectedUsers}
          onChange={this.handleUsersChange}
          wrappedComponentRef={this.userSearchPanel}
        >
          <div className="jm-us-containers">
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
          </div>
        </UserSearchPanel>
        <SelectedPanel
          tenementSelectable={tenementSelectable}
          departmentSelectable={departmentSelectable}
          tenements={selectedTenements}
          departments={selectedDepartments}
          users={selectedUsers}
          onChange={this.handleSelectedChange}
          formatter={this.props.formatter}
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
      currentDepartmentId: undefined,
      currentDepartment: undefined,
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

  private handleSelectedChange = ({
    users,
    departments,
    tenements,
  }: {
    users: UserDesc[] | undefined
    departments: DepartmentDesc[] | undefined
    tenements: TenementDesc[] | undefined
  }) => {
    this.handleUsersChange(users || [])
    this.handleDepartmentChange(departments || [])
    this.handleTenementChange(tenements || [])
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
      } = this.state
      this.props.onChange({
        users: selectedUsers || [],
        departments: selectedDepartments || [],
        tenements: selectedTenements || [],
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
        currentTenementId: undefined,
        currentTenement: undefined,
        currentDepartmentId: undefined,
        currentDepartment: undefined,
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
    return (this.props.locale || DefaultLocale)[key] || ''
  }
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
