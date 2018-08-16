/**
 * 用户选择器用户搜索
 * TODO: placeholder和数据项展示支持自定义
 * TODO: 区分平台搜索和企业搜索
 */
import React from 'react'
import Form from 'antd/lib/form'
import Button from 'antd/lib/button'
import Input from 'antd/lib/input'
import Spin from 'antd/lib/spin'
import Alert from 'antd/lib/alert'
import List from 'antd/lib/list'
import Pagination from 'antd/lib/pagination'
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { PaginationProps } from 'antd/lib/pagination'
import Group from './Group'
import { Adaptor, UserDesc } from '../Provider'
import withProvider from '../withProvider'
import { PageSize } from '../constants'

export interface UserSearchPanelProps {
  searchable?: boolean
  children: React.ReactNode
  // 如果tenementId为空，则为平台搜索
  tenementId?: string
  value?: UserDesc[]
  onChange?: (value: UserDesc[]) => void
}

interface Props extends UserSearchPanelProps, Adaptor {}

interface State {
  searchMode?: boolean
  searching?: boolean
  error?: Error
  query: string
  pagination: PaginationProps
  dataSource: UserDesc[]
}

class UserSearchPanel extends React.Component<Props, State> {
  public state: State = {
    query: '',
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
    dataSource: [],
  }
  public render() {
    const { searchable, children } = this.props
    const { searchMode } = this.state
    if (!searchable) {
      return <Group className="user-search-panel">{children}</Group>
    }

    return (
      <Group header={this.renderHeader()} className="user-search-panel">
        {searchMode ? this.renderBody() : children}
      </Group>
    )
  }

  public reset() {}

  private renderHeader() {
    const { query, searching, searchMode } = this.state
    return (
      <div>
        <Form layout="inline" onSubmit={this.handleSubmit}>
          <Form.Item>
            <Input
              size="small"
              placeholder="用户"
              value={query}
              onChange={this.handleQueryChange}
            />
          </Form.Item>
          <Form.Item>
            <Button
              size="small"
              htmlType="submit"
              type="primary"
              loading={searching}
            >
              搜索
            </Button>
          </Form.Item>
          {!!searchMode && (
            <Form.Item>
              <Button size="small" onClick={this.cancelSearch}>
                取消
              </Button>
            </Form.Item>
          )}
        </Form>
      </div>
    )
  }

  private renderBody() {
    const { searching, dataSource, pagination } = this.state
    return (
      <Spin spinning={searching}>
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
                {error.message}, <a onClick={this.search}>重试</a>
              </span>
            }
          />
        </div>
      )
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

  private handleQueryChange = (evt: React.ChangeEvent<{ value: string }>) => {
    this.setState({ query: evt.target.value })
  }

  private cancelSearch = () => {
    this.setState({
      searchMode: false,
      error: undefined,
      searching: false,
    })
  }

  private handleSubmit = (evt: React.FormEvent) => {
    evt.preventDefault()
    evt.stopPropagation()
    if (this.state.query.trim() === '') {
      return
    }
    this.setState(
      {
        searchMode: true,
        pagination: {
          ...this.state.pagination,
          current: 1,
        },
      },
      this.search,
    )
  }

  private search = async () => {
    if (this.state.searching) {
      return
    }

    try {
      this.setState({ searching: true, error: undefined })
      const {
        pagination: { current = 1, pageSize = PageSize },
        query,
      } = this.state
      const res = await this.props.searchUser(query, current, pageSize)
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
      this.setState({ searching: false })
    }
  }
}

export default withProvider(UserSearchPanel)
