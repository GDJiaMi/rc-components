import React from 'react'
import Pagination, { PaginationProps } from 'antd/es/pagination'
import Spin from 'antd/es/spin'
import message from 'antd/es/message'
import Empty from 'antd/es/empty'
import Alert from 'antd/es/alert'

export interface PageInfo {
  page: number
  offset: number
  pageSize: number
}

export interface ListProps<T> {
  idKey?: string
  onFetch: (pageInfo: PageInfo) => Promise<{ list: T[]; total: number }>
  onShift?: ShiftHandler<T>
  renderItem: (item: T, idx: number) => React.ReactNode
}

export type ShiftHandler<T> = (
  from: T,
  to: T,
  type: 'up' | 'down',
  instance: List<T>,
) => Promise<void>

interface State<T> {
  dataSource: T[]
  pagination: PaginationProps
  loading: boolean
  error?: Error
  empty?: boolean
}

/**
 * 简单带分页的列表组件
 */
export default class List<T> extends React.Component<ListProps<T>, State<T>> {
  public state: State<T> = {
    dataSource: [],
    loading: false,
    pagination: {
      size: 'small',
      pageSize: 15,
      total: 0,
      current: 1,
      onChange: cur => {
        this.setState(
          {
            ...this.state,
            pagination: { ...this.state.pagination, current: cur },
          },
          this.fetch,
        )
      },
    },
  }

  /**
   * 是否可以上移
   */
  public canShiftUp(id: any) {
    const [index] = this.getIndexById(id)
    return index !== 0
  }

  /**
   * 是否可以下移
   */
  public canShiftDown(id: any) {
    const [index] = this.getIndexById(id)
    const {
      pagination: { total = 0 },
    } = this.state
    return index < total - 1
  }

  public shiftUp(id: any) {
    return this.shift(id, 'up')
  }

  public shiftDown(id: any) {
    return this.shift(id, 'down')
  }

  /**
   * 移动元素
   */
  public async shift(id: any, dir: 'up' | 'down' = 'up') {
    const {
      pagination: { total = 0 },
    } = this.state
    const [index, indexInCurrentPage] = this.getIndexById(id)

    if (index === -1 || (dir === 'up' ? index === 0 : index === total - 1)) {
      return
    }

    const dataSource = [...this.state.dataSource]
    const shiftInPlace =
      dir === 'up'
        ? indexInCurrentPage > 0
        : indexInCurrentPage < dataSource.length - 1 // 非跨页

    // shift inplace
    if (shiftInPlace) {
      const toIndex =
        dir === 'up' ? indexInCurrentPage - 1 : indexInCurrentPage + 1
      const to = dataSource[toIndex]
      const current = dataSource[indexInCurrentPage]
      dataSource[toIndex] = current
      dataSource[indexInCurrentPage] = to
      // persist if need
      this.handleShift(current, to, dir, () => {
        // 触发更新
        this.setState({
          dataSource,
        })
      })
    } else {
      // shift remote
      const list = await this.fetchItem(dir === 'up' ? index - 1 : index + 1)
      if ((list && null) || list.length === 0) {
        throw new Error(
          `remote shift failed, can not fetch sibling item for ${index}`,
        )
      }

      this.handleShift(
        dataSource[indexInCurrentPage],
        list && list[0],
        dir,
        () => {
          dataSource[indexInCurrentPage] = list[0]
          this.setState({
            dataSource,
          })
        },
      )
    }
  }

  /**
   * 根据id获取字段在全局的索引
   * @returns [number, number] 全局索引，当前页面索引
   */
  public getIndexById(id: any): [number, number] {
    const { idKey = 'id' } = this.props
    const {
      dataSource,
      pagination: { pageSize = 15, current = 1 },
    } = this.state
    // @ts-ignore
    const indexInCurrentPage = dataSource.findIndex(i => i[idKey] === id)
    return [(current - 1) * pageSize + indexInCurrentPage, indexInCurrentPage]
  }

  public fetch = async () => {
    try {
      this.setState({
        error: undefined,
        loading: true,
      })
      const { pagination } = this.state
      let { current = 1, pageSize = 15 } = pagination
      let page = current
      let offset = (current - 1) * pageSize
      const { list, total } = await this.props.onFetch({
        page,
        offset,
        pageSize,
      })

      this.setState({
        dataSource: list,
        pagination: {
          ...pagination,
          total,
        },
        empty: total === 0,
      })
    } catch (err) {
      this.setState({
        error: err,
      })
    } finally {
      this.setState({
        loading: false,
      })
    }
  }

  public render() {
    const { pagination, dataSource, loading, empty, error } = this.state
    const { renderItem } = this.props
    return (
      <div className="jm-list">
        <Spin spinning={loading}>
          <div className="jm-list__body">{dataSource.map(renderItem)}</div>
          {!!error && (
            <Alert
              banner
              message={
                <span>
                  数据加载失败: {error.message},<a onClick={this.fetch}>重试</a>
                </span>
              }
            />
          )}
          {!!empty && <Empty description="暂无数据" />}
          <div className="jm-list__footer">
            {!!pagination.total && <Pagination {...pagination} />}
          </div>
        </Spin>
      </div>
    )
  }

  private fetchItem = async (index: number) => {
    const { list } = await this.props.onFetch!({
      page: index + 1,
      offset: index,
      pageSize: 1,
    })
    return list
  }

  private async handleShift(
    from: T,
    to: T,
    dir: 'up' | 'down',
    onSuccess: () => void,
  ) {
    if (!this.props.onShift) {
      onSuccess()
      return
    }

    try {
      this.setState({ loading: true })
      await this.props.onShift(from, to, dir, this)
      onSuccess()
    } catch (err) {
      message.error(err.message)
    } finally {
      this.setState({ loading: false })
    }
  }
}
