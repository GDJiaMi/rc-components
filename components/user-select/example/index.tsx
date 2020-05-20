import React from 'react'
import ReactDOM from 'react-dom'
import '../style/css'
import './style.css'
import Checkbox from 'antd/es/checkbox'
import Provider, { Adaptor, UserDesc, TenementDesc } from '../Provider'
import UserSelect, { IUserSelect, UserSelectValue } from '../UserSelect'
import DepartmentSelect, { DepartmentSelectValue } from '../DepartmentSelect'
import UserSearch from '../UserSearch'
import UserSearchComboBox from '../UserSearchComboBox'
import TenementSearch from '../TenementSearch'
import adaptor from './adaptor'

class App extends React.Component {
  public render() {
    return (
      <Provider adaptor={adaptor}>
        <BaseUse />
        <Department />
        <UserSearchTest />
        <TenementSearchTest />
      </Provider>
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
    checkStrictly: boolean
    onlyAllowCheckLeaf: boolean
    userGroupEnable: boolean
    userGroupMemberSelectable: boolean
    crossTenementEnable: boolean
  } = {
    value: {},
    keepValue: false,
    setMax: false,
    tenementSelectable: true,
    departmentSelectable: true,
    userSearchable: true,
    userSelectable: true,
    platformMode: true,
    checkStrictly: false,
    onlyAllowCheckLeaf: false,
    userGroupEnable: false,
    userGroupMemberSelectable: false,
    crossTenementEnable: false,
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
      checkStrictly,
      onlyAllowCheckLeaf,
      userGroupEnable,
      userGroupMemberSelectable,
      crossTenementEnable,
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
          checkStrictly={checkStrictly}
          userGroupEnable={userGroupEnable}
          userGroupSelectable
          userGroupMemberSelectable={userGroupMemberSelectable}
          crossTenementEnable={crossTenementEnable}
          onlyAllowCheckLeaf={onlyAllowCheckLeaf}
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
          checked={onlyAllowCheckLeaf}
          onChange={e =>
            this.setState({ onlyAllowCheckLeaf: e.target.checked })
          }
        >
          onlyAllowCheckLeaf
        </Checkbox>
        <Checkbox
          checked={checkStrictly}
          onChange={e => this.setState({ checkStrictly: e.target.checked })}
        >
          checkStrictly
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
        <Checkbox
          checked={userGroupEnable}
          onChange={e => this.setState({ userGroupEnable: e.target.checked })}
        >
          启用用户组选择(userGroupEnable)
        </Checkbox>
        <Checkbox
          checked={userGroupMemberSelectable}
          onChange={e =>
            this.setState({ userGroupMemberSelectable: e.target.checked })
          }
        >
          启用用户组用户选择(userGroupMemberSelectable)
        </Checkbox>
        <Checkbox
          checked={crossTenementEnable}
          onChange={e =>
            this.setState({ crossTenementEnable: e.target.checked })
          }
        >
          启用跨组织企业选择(crossTenementEnable)
        </Checkbox>
        <div>
          <a
            onClick={() => {
              this.userSelect.current.show()
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
          locale={{ tip: '最多选择5个部门, 只允许选择叶子节点' }}
        />
        <a
          onClick={() => {
            this.departmentSelect.current.show()
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
    value: [{ id: '1', name: 'test', mobile: '120' }] as UserDesc[],
    comboValue: 'xxx' as UserDesc | string,
  }
  public render() {
    return (
      <div>
        <h3>用户搜索</h3>
        <UserSearch
          value={this.state.value}
          onChange={value => this.setState({ value })}
          multiple
          ignoreEmpty
        />
        <UserSearch
          value={this.state.value}
          onChange={value => this.setState({ value })}
        />
        <h4>comboBox 模式</h4>
        <UserSearchComboBox
          allowClear
          value={this.state.comboValue}
          ignoreEmpty
          onChange={value => this.setState({ comboValue: value })}
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

// @ts-ignore
ReactDOM.render(<App />, document.getElementById('root'))
