import React from 'react'
import { Checkbox } from 'antd'
import {
  Title,
  UserSelect,
  UserSearch,
  TenementSearch,
  DepartmentSelect,
  AdminLayout,
} from '@gdjiami/rc-components'
import {
  IUserSelect,
  UserSelectValue,
  UserSelectProvider,
  UserDesc,
  TenementDesc,
} from '@gdjiami/rc-components/lib/user-select'
import { DepartmentSelectValue } from '@gdjiami/rc-components/lib/department-select'
import adaptor from './adaptor'

export default class UserSelectDemo extends React.Component {
  public render() {
    return (
      <AdminLayout.Body>
        <Title>用户选择器</Title>
        <UserSelectProvider adaptor={adaptor}>
          <BaseUse />
          <Department />
          <UserSearchTest />
          <TenementSearchTest />
        </UserSelectProvider>
      </AdminLayout.Body>
    )
  }
}

class BaseUse extends React.Component {
  private userSelect = React.createRef<IUserSelect>()
  state: {
    value: UserSelectValue
    keepValue: boolean
    setMax: boolean
    tenementSelectable: boolean
    departmentSelectable: boolean
    userSearchable: boolean
    userSelectable: boolean
    platformMode: boolean
  } = {
    value: {},
    keepValue: false,
    setMax: false,
    tenementSelectable: true,
    departmentSelectable: true,
    userSearchable: true,
    userSelectable: true,
    platformMode: true,
  }

  public render() {
    const {
      value,
      keepValue,
      setMax,
      tenementSelectable,
      departmentSelectable,
      userSearchable,
      userSelectable,
      platformMode,
    } = this.state
    return (
      <div>
        <h3>基本使用</h3>
        <UserSelect
          wrappedComponentRef={this.userSelect}
          value={value}
          tenementId={platformMode ? undefined : '12313'}
          onChange={this.handleChange}
          keepValue={keepValue}
          max={setMax ? 5 : undefined}
          maxDepartment={setMax ? 5 : undefined}
          maxTenement={setMax ? 5 : undefined}
          tenementSelectable={tenementSelectable}
          departmentSelectable={departmentSelectable}
          userSearchable={userSearchable}
          userSelectable={userSelectable}
        />
        <Checkbox
          checked={keepValue}
          onChange={e => this.setState({ keepValue: e.target.checked })}
        >
          keepValue(禁止移除旧数据)
        </Checkbox>
        <Checkbox
          checked={setMax}
          onChange={e => this.setState({ setMax: e.target.checked })}
        >
          max(设置max，maxDepartment, maxTenement为5)
        </Checkbox>
        <Checkbox
          checked={tenementSelectable}
          onChange={e =>
            this.setState({ tenementSelectable: e.target.checked })
          }
        >
          tenementSelectable(支持选择企业)
        </Checkbox>
        <Checkbox
          checked={departmentSelectable}
          onChange={e =>
            this.setState({ departmentSelectable: e.target.checked })
          }
        >
          departmentSelectable(支持选择部门)
        </Checkbox>
        <Checkbox
          checked={userSearchable}
          onChange={e => this.setState({ userSearchable: e.target.checked })}
        >
          userSearchable(支持用户搜索)
        </Checkbox>
        <Checkbox
          checked={platformMode}
          onChange={e => this.setState({ platformMode: e.target.checked })}
        >
          平台模式(tenementId为空时为平台模式)
        </Checkbox>
        <Checkbox
          checked={userSelectable}
          onChange={e => this.setState({ userSelectable: e.target.checked })}
        >
          支持用户选择(userSelectable)
        </Checkbox>
        <div>
          <a
            onClick={() => {
              this.userSelect.current!.show()
            }}
          >
            选择
          </a>
        </div>
      </div>
    )
  }

  private handleChange = (value: UserSelectValue) => {
    this.setState({ value })
  }
}

class Department extends React.Component {
  public state = {
    value: {} as DepartmentSelectValue,
  }
  private departmentSelect = React.createRef<IUserSelect>()
  public render() {
    const { value } = this.state
    return (
      <div>
        <h3>部门选择器</h3>
        <DepartmentSelect
          value={value}
          onChange={value => this.setState({ value })}
          wrappedComponentRef={this.departmentSelect}
          max="5"
          locale={{ tip: '最多选择5个部门' }}
        />
        <a
          onClick={() => {
            this.departmentSelect.current!.show()
          }}
        >
          选择
        </a>
      </div>
    )
  }
}

class UserSearchTest extends React.Component {
  state = {
    value: [] as UserDesc[],
  }
  public render() {
    return (
      <div>
        <h3>用户搜索</h3>
        <UserSearch
          value={this.state.value}
          onChange={value => this.setState({ value })}
          multiple
        />
      </div>
    )
  }
}

class TenementSearchTest extends React.Component {
  state = {
    value: [] as TenementDesc[],
  }
  public render() {
    return (
      <div>
        <h3>企业搜索</h3>
        <TenementSearch
          value={this.state.value}
          onChange={value => this.setState({ value })}
          multiple
        />
      </div>
    )
  }
}
