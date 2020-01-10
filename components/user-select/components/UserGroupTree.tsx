import React from 'react'
import { UserSelectContext, UserGroupDesc, TenementDesc } from '../Provider'
import { PaginationProps } from 'antd/es/pagination'
import Spin from 'antd/es/spin'

import withProvider from '../withProvider'
import { PageSize } from '../constants'
import Alert from 'antd/es/alert'
import List from 'antd/es/list'
import Checkbox from 'antd/es/checkbox'

export interface UserGroupTreeProps {
  // 当前部门
  tenementId?: string
  tenement?: TenementDesc

  // 可选模式
  selectable?: boolean

  // 选中
  onSelect: (id: string, item: UserGroupDesc) => void
  selected?: string

  // 选择
  value?: UserGroupDesc[]
  onChange: (value: UserGroupDesc[]) => void
  extra?: any
}

interface Props extends UserGroupTreeProps, UserSelectContext {}

interface State {
  loading?: boolean
  error?: Error
  pagination: PaginationProps
  dataSource?: UserGroupDesc[]
}

/**
 * 用户组选择器
 */
class UserGroupTree extends React.Component<Props, State> {
  public state: State = {
    loading: false,
    pagination: {
      current: 1,
      total: 0,
      pageSize: PageSize,
      hideOnSinglePage: true,
      size: 'small',
      onChange: current => {
        this.setState(
          {
            pagination: { ...this.state.pagination, current },
          },
          this.getUserGroup,
        )
      },
    },
  }

  public componentDidMount() {
    this.getUserGroup()
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.props.tenementId !== prevProps.tenementId) {
      this.reset(this.getUserGroup)
    }
  }

  public render() {
    const { loading, error } = this.state

    return (
      <Spin spinning={loading}>
        {!!error && (
          <Alert
            showIcon
            banner
            type="error"
            message={
              <span>
                {error.message}, <a onClick={this.getUserGroup}>重试</a>
              </span>
            }
          />
        )}
        {this.renderResult()}
      </Spin>
    )
  }

  private renderResult() {
    const { dataSource, pagination } = this.state

    return (
      <List
        bordered={false}
        split={false}
        size="small"
        dataSource={dataSource}
        renderItem={this.renderItem}
        pagination={pagination}
      />
    )
  }

  private renderItem = (item: UserGroupDesc) => {
    const { selected, selectable, value } = this.props
    const isSelected = selected === item.id

    const title = `${item.name}(${item.count})`
    const checked = value && value.findIndex(i => i.id === item.id) !== -1

    return (
      <div
        className={`jm-us-checkbox ${isSelected ? 'selected' : ''}`}
        onClickCapture={() => {
          this.handleSelect(item)
        }}
        title={title}
      >
        {selectable ? (
          <Checkbox
            checked={checked}
            onChange={evt => this.handleCheck(item, evt.target.checked)}
          >
            {title}
          </Checkbox>
        ) : (
          title
        )}
      </div>
    )
  }

  private handleSelect = (item: UserGroupDesc) => {
    this.props.onSelect(item.id, item)
  }

  private handleCheck = (item: UserGroupDesc, checked?: boolean) => {
    const v = [...(this.props.value || [])]
    const l = v.length
    const idx = v.findIndex(i => i.id === item.id)

    if (checked) {
      if (idx === -1) {
        v.push(item)
      }
    } else {
      if (idx !== -1) {
        v.splice(idx, 1)
      }
    }

    if (v.length !== l) {
      this.props.onChange(v)
    }
  }

  private reset(cb?: () => void) {
    this.setState(
      {
        pagination: { ...this.state.pagination, current: 1, total: 0 },
        dataSource: [],
        loading: false,
        error: undefined,
      },
      cb,
    )
  }

  private getUserGroup = async () => {
    const { tenementId } = this.props

    if (tenementId == null) {
      this.reset()
      return
    }

    if (this.state.loading) {
      return
    }

    try {
      this.setState({ loading: true, error: undefined })
      const { tenementId, extra } = this.props
      const { current = 1, pageSize = 15 } = this.state.pagination
      const res = await this.props.getUserGroup!(
        current,
        pageSize,
        tenementId,
        extra,
      )

      this.setState({
        dataSource: res.items,
        pagination: { ...this.state.pagination, total: res.total },
      })
    } catch (error) {
      this.setState({ error })
      console.warn(error)
    } finally {
      this.setState({ loading: false })
    }
  }
}

export default withProvider(UserGroupTree)
