/**
 * 用户待选区
 */
import React from 'react'
import Spin from 'antd/lib/spin'
import Alert from 'antd/lib/alert'
import Checkbox from 'antd/lib/checkbox'
import { CheckboxValueType } from 'antd/lib/checkbox/Group'
import Pagination, { PaginationProps } from 'antd/lib/pagination'
import { Adaptor, UserDesc, DepartmentDesc } from '../Provider'
import withProvider from '../withProvider'
import { PageSize } from '../constants'

export interface UsersPanelProps {
  tenementId?: string
  departmentId?: string
  department?: DepartmentDesc
  value?: UserDesc[]
  onChange?: (value: UserDesc[]) => void
}

interface Props extends UsersPanelProps, Adaptor {}

interface State {
  loading?: boolean
  error?: Error
  pagination: PaginationProps
  dataSource: UserDesc[]
}

class UsersPanelInner extends React.Component<Props, State> {
  public state: State = {
    dataSource: [],
    pagination: {
      current: 1,
      total: 0,
      pageSize: PageSize,
      size: 'small',
      hideOnSinglePage: true,
      onChange: current => {
        this.setState(
          {
            pagination: { ...this.state.pagination, current },
          },
          this.fetchUsers,
        )
      },
    },
  }

  public componentDidMount() {
    // 初始化
    this.fetchUsers()
  }

  public componentDidUpdate(preProps: Props) {
    if (
      this.props.tenementId !== preProps.tenementId ||
      this.props.departmentId !== preProps.departmentId
    ) {
      this.fetchUsers()
    }
  }

  public render() {
    const { loading, dataSource, pagination } = this.state
    const { value } = this.props
    return (
      <Spin spinning={loading} className="jm-us-container">
        {this.renderListHeader()}
        <div className="jm-us-container__body">
          <Checkbox.Group
            options={dataSource.map(i => ({
              label: i.name,
              value: i.id,
            }))}
            value={value && value.map(i => i.id)}
            onChange={this.handleChange}
          />
        </div>
        <Pagination {...pagination} />
      </Spin>
    )
  }

  public reset = () => {}

  private renderListHeader() {
    const { error } = this.state
    return (
      !!error && (
        <div className="jm-us-container__header">
          <Alert
            type="error"
            showIcon
            banner
            message={
              <span>
                {error.message}, <a onClick={this.fetchUsers}>重试</a>
              </span>
            }
          />
        </div>
      )
    )
  }

  private handleChange = (keys: CheckboxValueType[]) => {
    const value = this.props.value || []
    const selectedValue = keys
      .map(id => {
        let index = value.findIndex(i => i.id === id)
        if (index !== -1) {
          return value[index]
        }
        index = this.state.dataSource.findIndex(i => i.id === id)
        if (index !== -1) {
          return {
            ...this.state.dataSource[index],
            department: this.props.department,
          }
        }
        return undefined
      })
      .filter(m => m != null) as UserDesc[]
    if (this.props.onChange) {
      this.props.onChange(selectedValue)
    }
  }

  private fetchUsers = async () => {
    const { tenementId, departmentId } = this.props
    const { loading } = this.state
    if (tenementId == null || departmentId == null || loading) {
      return
    }
  }
}

export default withProvider(UsersPanelInner)
