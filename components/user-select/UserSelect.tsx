/**
 * 用户选择器
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
import memoize from 'lodash/memoize'
import SelectedPanel, {
  SelectedPanelFormatter,
  SelectedPanelValue,
} from './components/SelectedPanel'

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
  // 用户是支持搜索, 默认开启
  userSearchable?: boolean
  // 最多可选中用户, 默认不限制
  max?: number | string
  // 最多可选中部门
  maxDepartment?: number | string
  // 最多可选企业
  maxTenement?: number | string
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
  renderUserSearchItem?: (item: UserDesc) => React.ReactNode
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

  private renderBody() {
    const { tenementSelectable, tenementVisible, departmentSelectable } = this
    const {
      userSearchable,
      keepValue,
      tenementSearchPlaceholder,
      userSearchPlaceholder,
      renderUserSearchItem,
    } = this.props
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
            orgValue={this.props.value && this.props.value.tenements}
            value={selectedTenements}
            onChange={this.handleTenementChange}
            selected={currentTenementId}
            keepValue={keepValue}
            onSelect={this.handleTenementSelect}
            wrappedComponentRef={this.tenementSearchPanel}
            placeholder={tenementSearchPlaceholder}
          />
        )}
        <UserSearchPanel
          tenementId={currentTenementId}
          platformSearch={this.tenementVisible}
          searchable={userSearchable}
          value={selectedUsers}
          onChange={this.handleUsersChange}
          wrappedComponentRef={this.userSearchPanel}
          keepValue={keepValue}
          orgValue={this.props.value && this.props.value.users}
          header={this.props.header}
          placeholder={userSearchPlaceholder}
          renderItem={renderUserSearchItem}
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
              keepValue={keepValue}
              orgValue={this.props.value && this.props.value.departments}
            />
            <UsersPanel
              tenementId={currentTenementId}
              departmentId={currentDepartmentId}
              department={currentDepartment}
              value={selectedUsers}
              onChange={this.handleUsersChange}
              keepValue={keepValue}
              orgValue={this.props.value && this.props.value.users}
            />
          </div>
        </UserSearchPanel>
        <SelectedPanel
          tenementSelectable={tenementSelectable}
          departmentSelectable={departmentSelectable}
          keepValue={keepValue}
          orgValue={this.props.value}
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
        {this.props.footer}
        {!!tip && <div className="jh-us-tip">{tip}</div>}
        <Button onClick={this.handleCancel}>{cancelText}</Button>
        <Button onClick={this.handleOk} type="primary">
          {okText}
        </Button>
      </div>
    )
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
  }: UserSelectValue) => {
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
