/**
 * 用户待选区
 */
import React from 'react'
import Spin from 'antd/lib/spin'
import Alert from 'antd/lib/alert'
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox'
import List from 'antd/lib/list'
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
  orgValue?: UserDesc[]
  keepValue?: boolean
}

interface Props extends UsersPanelProps, Adaptor {}

interface State {
  loading?: boolean
  error?: Error
  pagination: PaginationProps
  dataSource: UserDesc[]
}

class UsersPanelInner extends React.PureComponent<Props, State> {
  public state: State = {
    loading: false,
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
      this.resetPagination(this.fetchUsers)
    }
  }

  public render() {
    const { loading, dataSource, pagination } = this.state
    return (
      <div className="jm-us-container">
        <Spin spinning={loading}>
          {this.renderListHeader()}
          <div className="jm-us-container__body">
            <List
              bordered={false}
              split={false}
              size="small"
              dataSource={dataSource}
              renderItem={this.renderItem}
            />
          </div>
          <Pagination className="jm-us-container__footer" {...pagination} />
        </Spin>
      </div>
    )
  }

  public reset = () => {
    this.resetPagination()
    this.setState({
      loading: false,
      error: undefined,
      dataSource: [],
    })
  }

  private renderListHeader() {
    const { error, dataSource } = this.state
    return (
      <div className="jm-us-container__header">
        {!!error ? (
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
        ) : dataSource && dataSource.length ? (
          <div>
            <a onClick={this.handleCheckAll}>全选</a>
            <a style={{ marginLeft: '1em' }} onClick={this.handleUncheck}>
              反选
            </a>
          </div>
        ) : null}
      </div>
    )
  }

  private renderItem = (item: UserDesc) => {
    const value = this.props.value || []
    const checked = value.findIndex(i => i.id === item.id) !== -1
    const disabled =
      this.props.keepValue &&
      this.props.orgValue &&
      this.props.orgValue.findIndex(i => i.id === item.id) !== -1
    return (
      <div className={`jm-us-checkbox`} title={item.name}>
        <Checkbox
          checked={checked}
          disabled={disabled}
          onChange={this.handleCheck(item)}
        >
          {item.name}
        </Checkbox>
      </div>
    )
  }

  private resetPagination = (cb?: () => void) => {
    this.setState(
      {
        pagination: { ...this.state.pagination, current: 1, total: 0 },
      },
      cb,
    )
  }

  private handleCheckAll = () => {
    const { dataSource } = this.state
    const value = [...(this.props.value || [])]
    if (dataSource == null || dataSource.length === 0) {
      return
    }
    for (const item of dataSource) {
      const index = value.findIndex(i => i.id === item.id)
      if (index === -1) {
        value.push(item)
      }
    }

    if (this.props.onChange) {
      this.props.onChange(value)
    }
  }

  private handleUncheck = () => {
    const { dataSource } = this.state
    const value = [...(this.props.value || [])]
    if (dataSource == null || dataSource.length === 0) {
      return
    }
    for (const item of dataSource) {
      const index = value.findIndex(i => i.id === item.id)
      if (index === -1) {
        value.push(item)
      } else {
        value.splice(index, 1)
      }
    }
    if (this.props.onChange) {
      this.props.onChange(value)
    }
  }

  private handleCheck(item: UserDesc) {
    return (evt: CheckboxChangeEvent) => {
      const value = [...(this.props.value || [])]
      const index = value.findIndex(i => i.id === item.id)
      if (evt.target.checked) {
        // 选中
        if (index !== -1) {
          return
        } else {
          value.push(item)
        }
      } else if (index !== -1) {
        value.splice(index, 1)
      }

      if (this.props.onChange) {
        this.props.onChange(value)
      }
    }
  }

  private fetchUsers = async () => {
    const { tenementId, departmentId } = this.props
    const { loading } = this.state
    if (loading) {
      return
    }
    if (tenementId == null || departmentId == null) {
      this.reset()
      return
    }

    try {
      this.setState({
        loading: true,
        error: undefined,
      })
      const {
        pagination: { current = 1, pageSize = PageSize },
      } = this.state
      const res = await this.props.getDepartmentUsers(
        tenementId,
        departmentId,
        current,
        pageSize,
      )
      this.setState({
        dataSource: res.items.map(i => ({
          ...i,
          department: this.props.department,
        })),
        pagination: {
          ...this.state.pagination,
          total: res.total,
        },
      })
    } catch (error) {
      this.setState({
        error,
      })
    } finally {
      this.setState({
        loading: false,
      })
    }
  }
}

export default withProvider(UsersPanelInner)
