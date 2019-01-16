/**
 * 部门树
 */
import React from 'react'
import Spin from 'antd/es/spin'
import Alert from 'antd/es/alert'
import Input from 'antd/es/input'
import Button from 'antd/es/button'
import Checkbox from 'antd/es/checkbox'
import Pagination, { PaginationProps } from 'antd/es/pagination'
import List from 'antd/es/list'
import Icon from 'antd/es/icon'
import Tree, { AntTreeNodeCheckedEvent, AntTreeNode } from 'antd/es/tree'
import message from 'antd/es/message'
import memoize from 'lodash/memoize'
import debounce from 'lodash/debounce'

import withProvider from '../withProvider'
import {
  Adaptor,
  DepartmentDesc,
  TenementDesc,
  DepartmentSearchResult,
} from '../Provider'
import { DefaultExpandedLevel, PageSize } from '../constants'
import { findAndReplace } from '../../fat-table/utils'

export interface DepartmentTreeProps {
  // 当前部门
  tenementId?: string
  tenement?: TenementDesc
  // 可选模式
  selectable?: boolean
  // 已激活部门
  selected?: string
  onSelect?: (value: string, detail?: DepartmentDesc) => void
  // 已选中部门
  value?: DepartmentDesc[]
  onChange?: (value: DepartmentDesc[]) => void
  checkStrictly?: boolean
  // 只允许选择叶子节点
  onlyAllowCheckLeaf?: boolean
  orgValue?: DepartmentDesc[]
  keepValue?: boolean
}

interface Props extends Adaptor, DepartmentTreeProps {}

interface State {
  loading?: boolean
  error?: Error
  searchKey?: string
  // 异步搜索模式
  searchMode?: boolean
  // 正在异步搜索
  searching?: boolean
  searchResult?: DepartmentSearchResult[]
  // TODO: 异常和分页
  searchError?: Error
  searchPagination: PaginationProps
  filter?: string
  dataSource?: DepartmentDesc
  dataSourceById?: { [key: string]: DepartmentDesc }
  expandedKeys?: string[]
}

class DepartmentTree extends React.PureComponent<Props, State> {
  public state: State = {
    loading: false,
    searchPagination: {
      current: 1,
      total: 0,
      pageSize: PageSize,
      size: 'small',
      hideOnSinglePage: true,
      onChange: current => {
        this.setState(
          {
            searchPagination: { ...this.state.searchPagination, current },
          },
          this.handleSearch,
        )
      },
    },
  }

  private preservedValue: DepartmentDesc[] = []
  /**
   * 是否是异步加载模式
   */
  private isLazyMode = this.props.getDepartmentChildren != null

  public componentDidMount() {
    this.fetchDepartment()
  }

  public componentDidUpdate(prevProps: Props) {
    // 需要获取更新
    if (this.props.tenementId !== prevProps.tenementId) {
      this.reset(this.fetchDepartment)
    }
  }

  public render() {
    const {
      loading,
      error,
      dataSource,
      searchKey,
      searchMode,
      searching,
    } = this.state

    return (
      <div className="jm-us-container">
        <Spin spinning={!!loading}>
          {!!dataSource && (
            <form
              onSubmit={this.handleSubmit}
              className="jm-department-filter__wrapper"
            >
              <Input
                className="jm-department-filter"
                prefix={<Icon type="filter" />}
                value={searchKey}
                onChange={this.handleFilterChange}
                size="small"
                placeholder="部门"
              />
              <Button
                size="small"
                htmlType="submit"
                className="jm-department-filter__button"
                loading={searching}
              >
                搜索
              </Button>
              {searchMode && (
                <Button
                  size="small"
                  className="jm-department-filter__button"
                  onClick={this.handleSearchCancel}
                >
                  取消
                </Button>
              )}
            </form>
          )}
          {!!error && (
            <Alert
              showIcon
              banner
              type="error"
              message={
                <span>
                  {error.message}, <a onClick={this.fetchDepartment}>重试</a>
                </span>
              }
            />
          )}
          <div
            className="jm-us-container__search-result"
            style={{ display: searchMode ? 'block' : 'none' }}
          >
            {this.renderSearchResult()}
          </div>
          <div className="jm-us-container__body">{this.renderTree()}</div>
        </Spin>
      </div>
    )
  }

  // 获取部门详情
  public getDepartment(id: string) {
    return this.state.dataSourceById && this.state.dataSourceById[id]
  }

  public reset(cb?: any) {
    this.setState(
      {
        loading: false,
        error: undefined,
        dataSource: undefined,
        dataSourceById: undefined,
        expandedKeys: undefined,
        filter: undefined,
        searchKey: undefined,
        searchMode: false,
        searching: false,
        searchResult: undefined,
        searchError: undefined,
      },
      cb,
    )
  }

  private renderTree = () => {
    const { checkStrictly, onlyAllowCheckLeaf } = this.props
    const { dataSource, expandedKeys } = this.state

    if (dataSource == null) {
      return null
    }

    const { selectable, value, selected, tenementId } = this.props
    const checkedKeys = (value || []).map(i => i.id)
    const selectedKeys = selected ? [selected] : undefined

    return (
      <Tree
        key={tenementId}
        loadData={this.isLazyMode ? this.fetchChildrenIfNeed : undefined}
        checkStrictly={checkStrictly || onlyAllowCheckLeaf}
        checkable={selectable}
        checkedKeys={checkedKeys}
        selectedKeys={selectedKeys}
        expandedKeys={expandedKeys}
        onCheck={this.handleTreeCheck}
        onSelect={this.handleTreeSelect}
        onExpand={this.handleExpand}
      >
        {this.renderTreeNode(dataSource)}
      </Tree>
    )
  }

  /**
   * 渲染树节点
   */
  private renderTreeNode = (tree: DepartmentDesc) => {
    const { selectable, keepValue, orgValue, onlyAllowCheckLeaf } = this.props
    const disabled =
      selectable &&
      keepValue &&
      orgValue &&
      orgValue.findIndex(i => i.id === tree.id) !== -1
    const filter = this.state.filter || ''
    const userCount = tree.userCount != null ? ` (${tree.userCount})` : ''
    const filterIndex = tree.name.search(new RegExp(filter, 'i'))
    const isLeaf = tree.children == null

    const title =
      filterIndex !== -1 ? (
        <span>
          {tree.name.substr(0, filterIndex)}
          <span className="jm-matching">
            {tree.name.substr(filterIndex, filterIndex + filter.length)}
          </span>
          {tree.name.substr(filterIndex + filter.length)}
          {userCount}
        </span>
      ) : (
        `${tree.name}${userCount}`
      )

    return tree.children != null && tree.children.length !== 0 ? (
      <Tree.TreeNode
        disableCheckbox={onlyAllowCheckLeaf || disabled}
        title={title}
        key={tree.id}
        // @ts-ignore
        id={tree.id}
      >
        {tree.children.map(subnode => this.renderTreeNode(subnode))}
      </Tree.TreeNode>
    ) : (
      <Tree.TreeNode
        disableCheckbox={disabled}
        isLeaf={isLeaf}
        title={title}
        key={tree.id}
        // @ts-ignore
        id={tree.id}
      />
    )
  }

  private renderSearchResult() {
    const { searchResult, searching, searchPagination } = this.state
    return (
      <Spin spinning={searching}>
        {this.renderListHeader()}
        {!!searchResult && (
          <List
            bordered={false}
            split={false}
            size="small"
            dataSource={searchResult}
            renderItem={this.renderSearchResultItem}
          />
        )}
        <Pagination className="jm-us-container__footer" {...searchPagination} />
      </Spin>
    )
  }

  private renderListHeader() {
    const { searchError: error } = this.state
    return (
      !!error && (
        <div className="jm-us-container__header">
          <Alert
            type="error"
            showIcon
            banner
            message={
              <span>
                {error.message}, <a onClick={this.handleSearch}>重试</a>
              </span>
            }
          />
        </div>
      )
    )
  }

  private renderSearchResultItem = (item: DepartmentSearchResult) => {
    const {
      selected,
      selectable,
      value,
      keepValue,
      orgValue,
      onlyAllowCheckLeaf,
    } = this.props
    const checked =
      selectable && value && value.findIndex(i => i.id === item.id) !== -1
    const disabled =
      selectable &&
      keepValue &&
      orgValue &&
      orgValue.findIndex(i => i.id === item.id) !== -1
    const isLeaf = item.leaf
    const disableCheckbox = (isLeaf ? onlyAllowCheckLeaf : false) || disabled

    return (
      <div
        className={`jm-us-checkbox ${selected === item.id ? 'selected' : ''}`}
        onClickCapture={() => this.handleSelect(item)}
        title={item.name}
      >
        {!!selectable ? (
          <Checkbox
            checked={checked}
            onChange={evt => this.handleCheck(item, evt.target.checked)}
            disabled={disableCheckbox}
          >
            {item.name}
          </Checkbox>
        ) : (
          item.name
        )}
      </div>
    )
  }

  private handleCheck = (item: DepartmentSearchResult, checked: boolean) => {
    this.saveItem(item)

    const { value } = this.props
    const selectedValue = [...(value || [])]

    if (checked) {
      selectedValue.push(this.state.dataSourceById![item.id])
    } else {
      const idx = selectedValue.findIndex(i => i.id === item.id)
      if (idx !== -1) {
        selectedValue.splice(idx, 1)
      }
    }

    if (this.props.onChange) {
      this.props.onChange(selectedValue)
    }
  }

  private saveItem(item: DepartmentSearchResult) {
    if (
      this.state.dataSourceById &&
      this.state.dataSourceById[item.id] == null
    ) {
      this.state.dataSourceById[item.id] = {
        ...item,
        tenement: this.props.tenement,
      } as DepartmentDesc
    }
  }

  private handleSelect = (item: DepartmentSearchResult) => {
    this.saveItem(item)
    this.handleTreeSelect([item.id])
  }

  private handleSubmit = (evt: React.FormEvent) => {
    evt.preventDefault()
    evt.stopPropagation()
    // 本地筛选
    if (!this.isLazyMode) {
      if (this.state.searchKey === this.state.filter) {
        return
      }

      this.setState(
        {
          filter: this.state.searchKey,
        },
        this.regenerateExpandedKeys,
      )
    } else {
      // 远程搜索
      if (this.props.searchDepartment == null) {
        throw new Error('[用户选择器]: 未提供部门搜索接口')
      }

      this.setState(
        {
          searchPagination: {
            ...this.state.searchPagination,
            current: 1,
            total: 0,
          },
        },
        this.handleSearch,
      )
    }
  }

  private handleSearchCancel = () => {
    this.setState({
      searchKey: '',
      searchMode: false,
      searching: false,
      searchResult: undefined,
    })
  }

  private handleFilterChange = (evt: React.ChangeEvent<{ value: string }>) => {
    this.setState({
      searchKey: evt.target.value,
    })
  }

  private regenerateExpandedKeys = debounce(() => {
    let newExpandedKeys: string[] = []
    const { dataSource, dataSourceById, filter = '' } = this.state
    if (dataSource == null || dataSourceById == null || filter.trim() === '') {
      newExpandedKeys =
        dataSource == null ? [] : DepartmentTree.getExpandedKeys(dataSource)
    } else {
      // 获取匹配节点的expandedKeys
      newExpandedKeys = DepartmentTree.genExpandedKeysForFilter(
        dataSource,
        new RegExp(filter, 'i'),
      )
    }
    this.setState({ expandedKeys: newExpandedKeys })
  }, 500)

  /**
   * 处理树节点选中
   * TODO: 支持checkStrictly模式
   */
  private handleTreeCheck = (
    keys: (string[]) | { checked: string[] },
    evt: AntTreeNodeCheckedEvent,
  ) => {
    const checkStrictly =
      this.props.checkStrictly || this.props.onlyAllowCheckLeaf
    const checkedTree: Array<{ pos: string; id: string }> = []
    keys = Array.isArray(keys) ? keys : keys.checked
    // FIXME: 异步模式下可能选择异常
    if (!checkStrictly) {
      const checkedPositions = (evt as any).checkedNodesPositions as Array<{
        node: { key: string }
        pos: string
      }>
      checkedPositions.forEach(pos => {
        const idToRemove: string[] = []
        let done = false

        // 遍历已选中的可以
        for (let i = 0; i < checkedTree.length; i++) {
          const key = checkedTree[i].pos

          // 存在更深的键
          if (key.startsWith(pos.pos)) {
            // 删除掉它
            idToRemove.push(checkedTree[i].id)
            continue
          } else if (pos.pos.startsWith(key)) {
            // already exist
            done = true
            break
          }
        }

        if (idToRemove.length) {
          idToRemove.forEach(i => {
            const idx = checkedTree.findIndex(item => item.id === i)
            if (idx !== -1) {
              checkedTree.splice(idx, 1)
            }
          })
        }

        if (!done) {
          checkedTree.push({ pos: pos.pos, id: pos.node.key })
        }
      })
    }

    // 将keys映射为DepartmentDesc[]
    const selectedValue = (checkStrictly ? keys : checkedTree.map(i => i.id))
      .map(id => {
        return this.state.dataSourceById![id]
      })
      .filter(i => !!i)
      .concat(this.preservedValue)

    if (this.props.onChange) {
      this.props.onChange(selectedValue)
    }
  }

  private handleExpand = (keys: string[]) => {
    this.setState({
      expandedKeys: keys,
    })
  }

  private handleTreeSelect = (keys: string[]) => {
    const departmentId = keys[0]
    if (this.props.onSelect) {
      const detail =
        this.state.dataSourceById && this.state.dataSourceById[departmentId]
      this.props.onSelect(departmentId, detail)
    }
  }

  private handleSearch = async () => {
    const { searchKey } = this.state
    if (searchKey == null || searchKey.trim() == '') {
      return
    }

    try {
      this.setState({
        searching: true,
        searchMode: true,
        searchError: undefined,
      })
      const { current = 1, pageSize = PageSize } = this.state.searchPagination
      const res = await this.props.searchDepartment!(
        searchKey,
        current,
        pageSize,
        this.props.tenementId,
      )
      this.setState({
        searchResult: res.items,
        searchPagination: {
          ...this.state.searchPagination,
          total: res.total,
        },
      })
    } catch (err) {
      this.setState({
        searchError: err,
      })
    } finally {
      this.setState({ searching: false })
    }
  }

  /**
   * 异步获取
   */
  private fetchChildrenIfNeed = async (node: AntTreeNode) => {
    const id = node.props.id
    const department = this.getDepartment(id)!
    if (
      !this.isLazyMode ||
      department.children == null ||
      department.children.length !== 0
    ) {
      return
    }

    try {
      const children = await this.props.getDepartmentChildren!(
        this.props.tenementId!,
        id,
      )
      if (Array.isArray(children) && children.length !== 0) {
        department.children = children
      } else {
        department.children = undefined
      }
      this.updateItem(department)
    } catch (err) {
      message.error(err.message)
    }
  }

  private updateItem(item: DepartmentDesc) {
    const dataSource = [this.state.dataSource!]
    const replaced = findAndReplace(dataSource, item, 'id')
    if (replaced !== dataSource) {
      this.state.dataSourceById![item.id] = item
      const newNodes = DepartmentTree.getCached(item, this.props.tenement)
      this.setState({
        dataSource: replaced[0],
        dataSourceById: {
          ...this.state.dataSourceById,
          ...newNodes,
        },
      })
    }
  }

  /**
   * 异步获取
   */
  private fetchChildrenIfNeed = async (node: AntTreeNode) => {
    const id = node.props.id
    const department = this.getDepartment(id)!
    if (
      !this.isLazyMode ||
      department.children == null ||
      department.children.length !== 0
    ) {
      return
    }

    try {
      const children = await this.props.getDepartmentChildren!(
        this.props.tenementId!,
        id,
      )
      if (Array.isArray(children) && children.length !== 0) {
        department.children = children
      } else {
        department.children = undefined
      }
      this.updateItem(department)
    } catch (err) {
      message.error(err.message)
    }
  }

  private updateItem(item: DepartmentDesc) {
    const dataSource = [this.state.dataSource!]
    const replaced = findAndReplace(dataSource, item, 'id')
    if (replaced !== dataSource) {
      this.state.dataSourceById![item.id] = item
      const newNodes = DepartmentTree.getCached(item, this.props.tenement)
      this.setState({
        dataSource: replaced[0],
        dataSourceById: {
          ...this.state.dataSourceById,
          ...newNodes,
        },
      })
    }
  }

  /**
   * 获取组织部门树
   */
  private fetchDepartment = async () => {
    const tenementId = this.props.tenementId
    if (tenementId == null) {
      this.reset()
      return
    }
    try {
      this.setState({ error: undefined, loading: true })
      const res = await this.props.getDepartmentTree(tenementId)
      // 缓存
      const cached = DepartmentTree.getCached(res, this.props.tenement)
      // 计算默认展开
      const expandedKeys = DepartmentTree.getExpandedKeys(res)
      this.setState(
        {
          dataSource: res,
          dataSourceById: cached,
          expandedKeys: [...expandedKeys],
        },
        () => {
          this.updatePreserveValue()
        },
      )
    } catch (error) {
      this.setState({ error })
    } finally {
      this.setState({ loading: false })
    }
  }

  /**
   * Tree选择是无法保留跨企业的数据的，所有需要计算非当前树的保留字段，避免被移除
   */
  private updatePreserveValue() {
    const value = this.props.value
    const tenementId = this.props.tenementId
    this.preservedValue = []
    if (value == null) {
      return
    }
    // 记录非当前企业的已选值
    for (const item of value) {
      if (item.tenement && item.tenement.id !== tenementId) {
        this.preservedValue.push(item)
      } else if (
        this.state.dataSourceById &&
        this.state.dataSourceById[item.id] == null
      ) {
        this.preservedValue.push(item)
      }
    }
  }

  private static getCached = (
    res: DepartmentDesc,
    tenement: TenementDesc | undefined,
  ) => {
    const cached = {}
    DepartmentTree.walkTree(res, tenement, cached)
    return cached
  }

  private static walkTree(
    tree: DepartmentDesc,
    tenement: TenementDesc | undefined,
    map: { [id: string]: DepartmentDesc },
  ) {
    map[tree.id] = { ...tree, tenement: tenement }
    if (tree.children && tree.children.length) {
      tree.children.forEach(n => {
        DepartmentTree.walkTree(n, tenement, map)
      })
    }
  }

  private static getExpandedKeys = memoize((res: DepartmentDesc) => {
    const expandedKeys: string[] = []
    DepartmentTree.genExpandedKeys(res, expandedKeys)
    return expandedKeys
  })

  private static genExpandedKeys = (
    tree: DepartmentDesc,
    keys: string[],
    level: number = 1,
  ) => {
    if (tree.open || level < DefaultExpandedLevel) {
      keys.push(tree.id)
    } else {
      return
    }
    if (tree.children != null && tree.children.length !== 0) {
      tree.children.forEach(subNode =>
        DepartmentTree.genExpandedKeys(subNode, keys, level + 1),
      )
    }
  }

  private static genExpandedKeysForFilter(res: DepartmentDesc, filter: RegExp) {
    const expandedKeys: string[] = []
    const iter = (node: DepartmentDesc) => {
      let findIt = false
      if (node.name.search(filter) !== -1) {
        findIt = true
      } else if (node.children) {
        for (let subNode of node.children) {
          if (iter(subNode)) {
            findIt = true
          }
        }
      }

      if (findIt) {
        expandedKeys.unshift(node.id)
      }

      return findIt
    }

    iter(res)
    return expandedKeys
  }
}

export default withProvider(DepartmentTree)
