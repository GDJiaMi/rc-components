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
      this.fetchUsers()
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

  public reset = () => {}

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
    return (
      <div className={`jm-us-checkbox`} title={item.name}>
        <Checkbox checked={checked} onChange={this.handleCheck(item)}>
          {item.name}
        </Checkbox>
      </div>
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
      this.setState({
        dataSource: [],
      })
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
        dataSource: res.items,
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
