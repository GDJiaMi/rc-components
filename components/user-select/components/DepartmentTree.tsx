/**
 * 部门树
 *
 * 异步模式部门合并策略
 * - 搜索: 在搜索发生选择事件时，进行延时性规范化，对选中项进行规范化
 *   - 本地规范: 如果选中的节点已经在渲染树中，将进行本地规范化
 *   - 远程规范: 如果选中节点在未在树中加载，则需要传递到远程进行规范化。 远程服务器缓存了完整的组织架构树
 * - 选择:
 *   - 通过搜索选中了下级部门，这时候选中父级部门需要将已选中的下级部门合并掉. 每个选中项应该有完整的parentIds路径，包括回显的数据
 * - 搜索项选中规则
 *   - 直接选中
 *   - 异步直接选中
 *   - 父节点被直接选中
 *   - 父节点被异步选中
 * // TODO: 显式配置异步模式
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

import { delay } from '../../utils/common'
import withProvider from '../withProvider'
import {
  Adaptor,
  DepartmentDesc,
  TenementDesc,
  DepartmentSearchResult,
} from '../Provider'
import { DefaultExpandedLevel, PageSize } from '../constants'
import { findAndReplace } from '../../fat-table/utils'

import {
  PathTree,
  PathNodeWithChildren,
  normalizedPathNodesInUncheck,
} from './utils'

export interface DepartmentTreeProps {
  // 当前部门
  tenementId?: string
  tenement?: TenementDesc
  // 可选模式
  selectable?: boolean
  searchable?: boolean
  // 已激活部门
  selected?: string
  onSelect?: (value: string, detail?: DepartmentDesc) => void
  // 已选中部门
  value?: DepartmentDesc[]
  onChange: (value: DepartmentDesc[]) => void
  checkStrictly?: boolean
  // 只允许选择叶子节点
  onlyAllowCheckLeaf?: boolean
  orgValue?: DepartmentDesc[]
  keepValue?: boolean
  childrenUncheckable?: boolean
  onNormalizeStart?: () => void
  onNormalizeEnd?: () => void
}

interface Props extends Adaptor, DepartmentTreeProps {}

interface State {
  loading?: boolean
  normalizing?: boolean
  error?: Error
  searchKey?: string
  // 异步搜索模式
  searchMode?: boolean
  // 正在异步搜索
  searching?: boolean
  searchResult?: DepartmentSearchResult[]
  searchUncheckedKeys: { [key: string]: boolean }
  // TODO: 异常和分页
  searchError?: Error
  searchPagination: PaginationProps
  filter?: string
  dataSource?: DepartmentDesc
  dataSourceById?: { [key: string]: DepartmentDesc }
  expandedKeys?: string[]
  checkedValue?: string[]
  checkedValueInSet?: Set<string>
}

class DepartmentTree extends React.PureComponent<Props, State> {
  static defaultProps = {
    childrenUncheckable: true,
  }

  public state: State = {
    loading: false,
    searchUncheckedKeys: {},
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

  /**
   * 是否是异步加载模式
   */
  private isLazyMode = this.props.getDepartmentChildren != null

  /**
   * 缓存其他企业, 或异步加载的已选中的节点，避免在树选择后被清空
   */
  private preservedValue: DepartmentDesc[] = []
  private preservedValueInSet: Set<string> = new Set()
  private normalizedDepartments: { [key: string]: DepartmentSearchResult } = {}
  /**
   * 跟踪搜索状态选中和取消状态. 新增和取消的节点会在后端进行合并.后端拥有完整的组织架构树
   */
  private searchItemCheckedDiff?: {
    [id: string]: { checked: boolean; item: DepartmentDesc }
  }

  private tree = React.createRef<Tree>()

  public componentDidMount() {
    this.fetchDepartment()
  }

  public componentDidUpdate(prevProps: Props) {
    // 需要获取更新
    if (this.props.tenementId !== prevProps.tenementId) {
      this.reset(this.fetchDepartment)
    } else if (this.props.value !== prevProps.value) {
      this.updateCheckedValue()
    }
  }

  public render() {
    const { searchable } = this.props
    const {
      loading,
      normalizing,
      error,
      dataSource,
      searchKey,
      searchMode,
      searching,
    } = this.state

    return (
      <div className="jm-us-container">
        <Spin spinning={!!loading || !!normalizing}>
          {!!dataSource && !!searchable && (
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
        searchUncheckedKeys: {},
        searchError: undefined,
        checkedValue: undefined,
        checkedValueInSet: undefined,
      },
      cb,
    )
  }

  private renderTree = () => {
    const { checkStrictly, onlyAllowCheckLeaf } = this.props
    const { dataSource, expandedKeys, checkedValue } = this.state

    if (dataSource == null) {
      return null
    }

    const { selectable, selected, tenementId } = this.props
    const checkedKeys = checkedValue
    const selectedKeys = selected ? [selected] : undefined

    return (
      <Tree
        key={tenementId}
        ref={this.tree}
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

  /**
   * 渲染搜索结果
   */
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
      keepValue,
      orgValue,
      childrenUncheckable,
      onlyAllowCheckLeaf,
    } = this.props
    const [checked, checkedDirectly] =
      selectable && this.isSearchItemChecked(item)
    const disabled =
      selectable &&
      (keepValue &&
        orgValue &&
        orgValue.findIndex(i => i.id === item.id) !== -1)
    const isLeaf = item.leaf
    const disabledByLeaf = isLeaf ? onlyAllowCheckLeaf : false
    // 禁止非直接选中的checkbox
    const disabledByLazyMode =
      this.isLazyMode && checked && !childrenUncheckable && !checkedDirectly
    const disableCheckbox =
      disabledByLeaf ||
      // 已选中的父级部门，不能反选
      disabledByLazyMode ||
      disabled

    return (
      <div
        className={`jm-us-checkbox ${selected === item.id ? 'selected' : ''}`}
        onClickCapture={() => {
          this.handleSelect(item)
        }}
        title={item.name}
      >
        {!!selectable ? (
          <Checkbox
            checked={checked}
            style={{ opacity: disableCheckbox ? 0.5 : 1 }}
            onChange={evt => {
              disableCheckbox
                ? message.info(
                    disabledByLeaf
                      ? '只能选中叶子节点'
                      : '无法取消，已选中父节点',
                  )
                : this.handleCheck(item, evt.target.checked)
            }}
          >
            {item.name}
          </Checkbox>
        ) : (
          item.name
        )}
      </div>
    )
  }

  /**
   * 检查搜索项是否处理选中状态
   * @returns [boolean, boolean] 1 是否选中 2. 是否直接选中
   */
  private isSearchItemChecked(
    item: DepartmentSearchResult,
  ): [boolean, boolean] {
    const { checkedValueInSet, searchUncheckedKeys } = this.state
    const parents = item.parentIds
    if (searchUncheckedKeys[item.id]) {
      return [false, true]
    } else if (checkedValueInSet && checkedValueInSet.has(item.id)) {
      return [true, true]
    } else if (
      parents &&
      parents.some(
        i =>
          (!!checkedValueInSet && checkedValueInSet.has(i)) ||
          this.preservedValueInSet.has(i),
      )
    ) {
      // 父节点选中
      return [true, false]
    } else if (this.preservedValueInSet.has(item.id)) {
      // 未加载节点选中
      return [true, true]
    }

    return [false, false]
  }

  /**
   * 更新保留的已选中项
   */
  private updateCheckedValue() {
    const value = this.props.value || []
    const preservedValue: DepartmentDesc[] = []
    const unloadedDepartments: DepartmentDesc[] = []
    const preservedValueInSet = new Set<string>()
    const checkedValue: string[] = []
    const checkedValueInSet = new Set<string>()
    const tenementId = this.props.tenementId
    // 内部树， 缓存了已渲染的树节点
    const innerTree = this.tree.current && this.tree.current.tree

    value.forEach(val => {
      if (tenementId && val.tenement && val.tenement.id !== tenementId) {
        // 其他企业的已选中项
        preservedValue.push(val)
        preservedValueInSet.add(val.id)
      } else if (
        innerTree &&
        innerTree.state.keyEntities &&
        !(val.id in innerTree.state.keyEntities)
      ) {
        // 未在已渲染的树中
        preservedValue.push(val)
        preservedValueInSet.add(val.id)
        if (!this.props.checkStrictly && this.isLazyMode) {
          unloadedDepartments.push(val)
        }
      } else {
        // 当前树已选中节点
        checkedValue.push(val.id)
        checkedValueInSet.add(val.id)
      }
    })

    this.preservedValue = preservedValue
    this.preservedValueInSet = preservedValueInSet
    this.setState({
      checkedValue,
      checkedValueInSet,
    })

    if (unloadedDepartments.length) {
      this.normalizeUnloadedDepartments(unloadedDepartments)
    }
  }

  /**
   * 搜索项选中. 异步模式下比较复杂，需要一些选中项可以在本地进行合并，而另外一些需要
   * 传递后后台进行合并
   */
  private handleCheck = (item: DepartmentSearchResult, checked: boolean) => {
    this.saveItem(item)

    const { value } = this.props
    const selectedValue = [...(value || [])]
    const itemInTree = this.isSearchItemInTree(item)

    // 更新value
    if (checked) {
      selectedValue.push(this.state.dataSourceById![item.id])
      this.setState({
        searchUncheckedKeys: {
          ...this.state.searchUncheckedKeys,
          [item.id]: false,
        },
      })
    } else {
      const idx = selectedValue.findIndex(i => i.id === item.id)
      if (idx !== -1) {
        selectedValue.splice(idx, 1)
      } else {
        // 需要记录unchecked的状态
        if (itemInTree) {
          // 这时候需要强制localNormalize
          this.localNormalizeUncheckState(item.id)
          return
        } else {
          this.setState({
            searchUncheckedKeys: {
              ...this.state.searchUncheckedKeys,
              [item.id]: true,
            },
          })
        }
      }
    }

    // 异步模式下，且选中节点不在树中，需要记录下来
    if (!this.props.checkStrictly && this.isLazyMode && !itemInTree) {
      this.normalizedDepartments[`${this.props.tenementId}-${item.id}`] = item
      let checkedDiff = { ...(this.searchItemCheckedDiff || {}) }
      if (item.id in checkedDiff) {
        // 恢复
        if (checkedDiff[item.id].checked !== checked) {
          delete checkedDiff[item.id]
        }
      } else {
        checkedDiff[item.id] = { checked, item: item }
      }

      this.searchItemCheckedDiff = checkedDiff
    }

    this.props.onChange(selectedValue)
    this.props.onNormalizeStart!()
    this.normalizeSearchCheckState()
  }

  /**
   * 判断指定选项是否在已渲染的树种
   */
  private isSearchItemInTree(item: DepartmentSearchResult) {
    const innerTree = this.tree.current && this.tree.current.tree
    if (innerTree == null) {
      return false
    }

    const keyEntities = innerTree.state.keyEntities
    return item.id in keyEntities
  }

  /**
   * 搜索取消. 在这个时机对选中节点进行规范化
   */
  private handleSearchCancel = () => {
    this.setState({
      searchKey: '',
      searchMode: false,
      searching: false,
      searchResult: undefined,
      searchUncheckedKeys: {},
    })
  }

  /**
   * 规范化搜索选中项
   */
  private normalizeSearchCheckState = debounce(async () => {
    try {
      this.setState({ normalizing: true })
      // 首先进行本地规范化
      await this.localNormalizeCheckState()
      // 远程规范化
      await this.remoteNormalizeCheckState()
      this.searchItemCheckedDiff = undefined
    } catch (err) {
      message.info(err.message)
    } finally {
      this.setState({ normalizing: false })
      this.props.onNormalizeEnd!()
    }
  }, 1000)

  private localNormalizeUncheckState(key: string) {
    if (this.props.checkStrictly || this.tree.current == null) {
      return
    }

    // 访问内部的树结构，需要从里面获取选中状态
    const innerTree = (this.tree.current as any).tree
    if (innerTree == null) {
      console.warn('请更新到antd 3.11 以上版本')
      return
    }

    // 获取树的选中状态
    const checkedKey = innerTree.state.checkedKeys as string[]
    const keyEntities = innerTree.state.keyEntities
    const posInTree: Array<
      PathNodeWithChildren<{ key: string }>
    > = checkedKey.map(i => keyEntities[i])
    const filteredKeys = normalizedPathNodesInUncheck(
      posInTree,
      keyEntities[key],
    ).map(i => i.node.key)
    const selectedValue = this.preProcessPreservedValue(filteredKeys).concat(
      filteredKeys
        .map(i => {
          return this.state.dataSourceById![i]
        })
        .filter(i => !!i),
    )

    this.props.onChange(selectedValue)
  }

  /**
   * 本地对树的选中节点进行合并.
   */
  private async localNormalizeCheckState() {
    if (this.props.checkStrictly || this.tree.current == null) {
      return
    }

    // 访问内部的树结构，需要从里面获取选中状态
    const innerTree = (this.tree.current as any).tree
    if (innerTree == null) {
      console.warn('请更新到antd 3.11 以上版本')
      return
    }

    // 获取树的选中状态
    const checkedKey = innerTree.state.checkedKeys as string[]
    const keyEntities = innerTree.state.keyEntities
    const posInTree: Array<{
      node: { key: string }
      pos: string
    }> = checkedKey.map(i => keyEntities[i])
    // 规范化
    const filteredKeys = PathTree.normalizedPathNodes(posInTree).map(
      i => i.node.key,
    )

    const selectedValue = this.preProcessPreservedValue(filteredKeys).concat(
      filteredKeys
        .map(i => {
          return this.state.dataSourceById![i]
        })
        .filter(i => !!i),
    )

    this.props.onChange(selectedValue)
    await delay(0)
  }

  /**
   * 远程对树的选中节点进行合并，适用于异步加载模式
   */
  private remoteNormalizeCheckState = async () => {
    if (
      this.props.checkStrictly ||
      !this.isLazyMode ||
      this.searchItemCheckedDiff == null
    ) {
      return
    }

    if (this.props.normalizeDepartmentChecked == null) {
      console.warn('未提供normalizeDepartmentChecked方法')
      return
    }

    let value = this.props.value || []
    const state = this.searchItemCheckedDiff
    const keys = Object.keys(state)
    if (keys.length === 0) {
      return
    }

    let added: DepartmentDesc[] = []
    const removed: DepartmentDesc[] = []
    keys.forEach(k => {
      if (state[k].checked) {
        added.push(state[k].item)
      } else {
        removed.push(state[k].item)
      }
    })

    // 再一次规范化跟踪记录, 因为可能在其他地方被取消选中
    added = added.filter(item => value.findIndex(i => i.id === item.id) !== -1)

    const preserved: DepartmentDesc[] = []
    const allChecked: DepartmentDesc[] = []
    const tenementId = this.props.tenementId

    // 移除重复的数据, 和其他企业选中的值
    value.forEach(i => {
      if (i.tenement && i.tenement.id !== tenementId) {
        preserved.push(i)
      } else if (added.findIndex(item => item.id === i.id) === -1) {
        allChecked.push(i)
      }
    })

    // 远程规范化，返回规范化后的所有数据
    const res = await this.props.normalizeDepartmentChecked(
      allChecked,
      added,
      removed,
    )
    const normalized = res.map(i => {
      i.tenement = this.props.tenement
      this.normalizedDepartments[`${tenementId}-${i.id}`] = i
      return i
    })

    this.props.onChange(preserved.concat(normalized))
  }

  /**
   * 规范化回显数据
   */
  private async normalizeUnloadedDepartments(departments: DepartmentDesc[]) {
    if (departments.length === 0 || this.state.normalizing) {
      return
    }
    const tenementId = this.props.tenementId
    const filtered = departments.filter(
      i =>
        i.parentIds == null &&
        this.normalizedDepartments[`${tenementId}-${i.id}`] == null,
    )

    if (filtered.length === 0) {
      return
    }

    if (this.props.getDepartmentDetail == null) {
      throw new Error(`[user-select]: 未提供getDepartmentDetail方法`)
    }

    try {
      this.setState({ normalizing: true })
      const res = await this.props.getDepartmentDetail(
        filtered.map(i => i.id),
        this.props.tenementId,
      )
      res.forEach(i => {
        this.normalizedDepartments[`${tenementId}-${i.id}`] = {
          ...i,
          tenement: this.props.tenement,
        }
      })
    } catch (err) {
      message.info(err.message)
    } finally {
      this.setState({ normalizing: false })
    }
  }

  /**
   * 缓存到dataSourceById中
   */
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
   * 过滤保留的节点
   */
  private preProcessPreservedValue(checked: string[]) {
    return this.preservedValue.filter(val => {
      // 非本企业节点
      if (val.tenement && val.tenement.id !== this.props.tenementId) {
        return true
      }

      // 没有路径信息的节点
      const normalized = this.normalizedDepartments[
        `${this.props.tenementId}-${val.id}`
      ]

      if (normalized == null) {
        return true
      }

      const parentIds = normalized.parentIds
      // 过滤掉父节点已选中的异步节点
      return !parentIds.some(id => checked.indexOf(id) !== -1)
    })
  }

  /**
   * 处理树节点选中
   * TODO: 支持checkStrictly模式
   */
  private handleTreeCheck = (
    keys: (string[]) | { checked: string[] },
    evt: AntTreeNodeCheckedEvent,
  ) => {
    keys = Array.isArray(keys) ? keys : keys.checked
    const checkStrictly =
      this.props.checkStrictly || this.props.onlyAllowCheckLeaf
    const isLazyMode = this.isLazyMode
    let checkedTree: string[] = []

    if (!checkStrictly) {
      const checkedPositions = (evt as any).checkedNodesPositions as Array<{
        node: { key: string }
        pos: string
      }>
      const filteredPositions = PathTree.normalizedPathNodes(checkedPositions)
      checkedTree = filteredPositions.map(pos => pos.node.key)
    }

    const preProcessPreservedValue = () => {
      if (!evt.checked || checkStrictly || !isLazyMode) {
        return this.preservedValue
      }

      return this.preProcessPreservedValue(checkedTree)
    }

    // 将keys映射为DepartmentDesc[]
    const selectedValue = preProcessPreservedValue().concat(
      (checkStrictly ? keys : checkedTree)
        .map(id => {
          return this.state.dataSourceById![id]
        })
        .filter(i => !!i),
    )

    this.props.onChange(selectedValue)
  }

  /**
   * 异步加载的树无法记录当前选中的节点，所以需要强制进行更新
   */
  private forceUpdateTreeCheckState() {
    this.props.onChange([...(this.props.value || [])])
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
      const normalized = res.items.map(i => {
        i.tenement = this.props.tenement
        return i
      })
      this.setState({
        searchResult: normalized,
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
      setTimeout(() => this.forceUpdateTreeCheckState(), 100)
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
          // 更新选中项
          this.updateCheckedValue()
        },
      )
    } catch (error) {
      this.setState({ error })
    } finally {
      this.setState({ loading: false })
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
