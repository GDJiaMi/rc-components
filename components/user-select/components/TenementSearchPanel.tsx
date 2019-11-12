/**
 * 用户选择器中的企业搜索框和搜索结果展示
 */
import React from 'react'
import Form from 'antd/es/form'
import Button from 'antd/es/button'
import Input from 'antd/es/input'
import Spin from 'antd/es/spin'
import Alert from 'antd/es/alert'
import List from 'antd/es/list'
import message from 'antd/es/message'
import Pagination from 'antd/es/pagination'
import Checkbox, { CheckboxChangeEvent } from 'antd/es/checkbox'
import { PaginationProps } from 'antd/es/pagination'
import { TenementDesc, UserSelectContext } from '../Provider'
import withProvider from '../withProvider'
import Group from './Group'
import { PageSize } from '../constants'

export interface TenementSearchPanelProps {
  // 是否可选
  selectable?: boolean
  orgValue?: TenementDesc[]
  value?: TenementDesc[]
  onChange?: (value: TenementDesc[]) => void
  // 当前选中的企业
  selected?: string
  onSelect?: (tenementId: string, detail: TenementDesc) => void
  keepValue?: boolean
  placeholder?: string
  normalizing?: boolean
  extra?: any
}

interface Props extends TenementSearchPanelProps, UserSelectContext {}

interface State {
  query: string
  pagination: PaginationProps
  loading?: boolean
  dataSource: TenementDesc[]
  error?: Error
}

class TenementSearchPanelInner extends React.Component<Props, State> {
  public state: State = {
    query: '',
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
          this.search,
        )
      },
    },
  }

  public componentDidMount() {
    // 初始化
    this.search()
  }

  public render() {
    return (
      <Group className="tenement-search-panel" header={this.renderHeader()}>
        {this.renderBody()}
      </Group>
    )
  }

  public reset = () => {
    this.setState(
      {
        query: '',
        loading: false,
        error: undefined,
        pagination: {
          ...this.state.pagination,
          current: 1,
          total: 0,
        },
        // 恢复默认
      },
      this.search,
    )
  }

  private renderHeader() {
    const { query, loading } = this.state

    return (
      <div>
        <Form layout="inline" onSubmit={this.handleSubmit}>
          <Form.Item>
            <Input
              size="small"
              placeholder={this.props.placeholder || '企业'}
              value={query}
              onChange={this.handleQueryChange}
            />
          </Form.Item>
          <Form.Item>
            <Button
              size="small"
              htmlType="submit"
              type="primary"
              loading={loading}
            >
              搜索
            </Button>
          </Form.Item>
        </Form>
      </div>
    )
  }

  private renderBody() {
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
                {error.message}, <a onClick={this.handleReload}>重试</a>
              </span>
            }
          />
        </div>
      )
    )
  }

  private renderItem = (item: TenementDesc) => {
    const value = this.props.value || []
    const selectable = this.props.selectable
    const checked = selectable && value.findIndex(i => i.id === item.id) !== -1
    const normalizing = this.props.normalizing
    const disabled =
      selectable &&
      this.props.keepValue &&
      this.props.orgValue &&
      this.props.orgValue.findIndex(i => i.id === item.id) !== -1
    const selected = this.props.selected === item.id
    return (
      <div
        className={`jm-us-checkbox ${selected ? 'selected' : ''} ${
          normalizing ? 'disabled' : ''
        }`}
        onClickCapture={this.handleSelect(item)}
        title={item.name}
      >
        {!!selectable ? (
          <Checkbox
            checked={checked}
            onChange={this.handleCheck(item)}
            disabled={disabled}
          >
            {item.name}
          </Checkbox>
        ) : (
          item.name
        )}
      </div>
    )
  }

  private handleSelect(item: TenementDesc) {
    if (this.props.onSelect) {
      const onSelect = this.props.onSelect
      return (evt: React.MouseEvent) => {
        if (this.props.normalizing) {
          message.info('正在合并节点，请稍后')
          return
        }
        onSelect(item.id, item)
      }
    }
    return undefined
  }

  private handleCheck(item: TenementDesc) {
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

  private handleQueryChange = (evt: React.ChangeEvent<{ value: string }>) => {
    this.setState({ query: evt.target.value })
  }

  private handleReload = () => {
    this.search()
  }

  private handleSubmit = (evt: React.FormEvent) => {
    evt.preventDefault()
    evt.stopPropagation()
    this.setState(
      {
        pagination: { ...this.state.pagination, current: 1 },
      },
      this.search,
    )
  }

  private search = async () => {
    if (this.state.loading) {
      return
    }

    try {
      this.setState({ error: undefined, loading: true })
      const {
        pagination: { current = 1, pageSize = PageSize },
        query,
      } = this.state
      const res = await this.props.searchTenement(
        query.trim(),
        current,
        pageSize,
        this.props.extra,
      )
      this.setState({
        dataSource: res.items,
        pagination: {
          ...this.state.pagination,
          total: res.total,
        },
      })
    } catch (error) {
      this.setState({ error })
    } finally {
      this.setState({ loading: false })
    }
  }
}

export default withProvider(TenementSearchPanelInner)
