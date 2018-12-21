/**
 * 部门树
 */
import React from 'react'
import Spin from 'antd/es/spin'
import Alert from 'antd/es/alert'
import Input from 'antd/es/input'
import Button from 'antd/es/button'
import Icon from 'antd/es/icon'
import Tree, { AntTreeNodeCheckedEvent } from 'antd/es/tree'
import memoize from 'lodash/memoize'
import debounce from 'lodash/debounce'
import withProvider from '../withProvider'
import { Adaptor, DepartmentDesc, TenementDesc } from '../Provider'
import { DefaultExpandedLevel } from '../constants'

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
  filter?: string
  dataSource?: DepartmentDesc
  dataSourceById?: { [key: string]: DepartmentDesc }
  expandedKeys?: string[]
}

class DepartmentTree extends React.PureComponent<Props, State> {
  public state: State = {
    loading: false,
  }

  private preservedValue: DepartmentDesc[] = []

  public componentDidMount() {
    this.fetchDepartment()
  }

  public componentDidUpdate(prevProps: Props) {
    // 需要获取更新
    if (this.props.tenementId !== prevProps.tenementId) {
      this.fetchDepartment()
    }
  }

  public render() {
    const { loading, error, dataSource } = this.state
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
                onChange={this.handleFilterChange}
                size="small"
                placeholder="筛选部门"
              />
              <Button
                size="small"
                htmlType="submit"
                className="jm-department-filter__button"
              >
                筛选
              </Button>
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
          <div className="jm-us-container__body">{this.renderTree()}</div>
        </Spin>
      </div>
    )
  }

  // 获取部门详情
  public getDepartment(id: string) {
    return this.state.dataSourceById && this.state.dataSourceById[id]
  }

  public reset() {
    this.setState({
      loading: false,
      error: undefined,
      dataSource: undefined,
      dataSourceById: undefined,
      expandedKeys: undefined,
    })
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
    const filterIndex = tree.name.indexOf(filter)
    const beforeStr = tree.name.substr(0, filterIndex)
    const afterStr = tree.name.substr(filterIndex + filter.length)

    const title =
      filterIndex !== -1 ? (
        <span>
          {beforeStr}
          <span className="jm-matching">{filter}</span>
          {afterStr}
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
        title={title}
        key={tree.id}
        // @ts-ignore
        id={tree.id}
      />
    )
  }

  private handleSubmit = (evt: React.FormEvent) => {
    evt.preventDefault()
    evt.stopPropagation()
    if (this.state.searchKey === this.state.filter) {
      return
    }

    this.setState(
      {
        filter: this.state.searchKey,
      },
      this.regenerateExpandedKeys,
    )
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
        filter,
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
    if (!checkStrictly) {
      const checkedPositions = (evt as any).checkedNodesPositions as Array<{
        node: { key: string }
        pos: string
      }>
      checkedPositions.forEach(pos => {
        let done = false
        for (let i = 0; i < checkedTree.length; i++) {
          const key = checkedTree[i].pos
          if (key.startsWith(pos.pos)) {
            // replace
            checkedTree.splice(i, 1, {
              pos: pos.pos,
              id: pos.node.key,
            })
            done = true
            break
          } else if (pos.pos.startsWith(key)) {
            // already exist
            done = true
            break
          }
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

  private static getCached = memoize(
    (res: DepartmentDesc, tenement: TenementDesc | undefined) => {
      const cached = {}
      DepartmentTree.walkTree(res, tenement, cached)
      return cached
    },
  )

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

  private static genExpandedKeysForFilter(res: DepartmentDesc, filter: string) {
    const expandedKeys: string[] = []
    const iter = (node: DepartmentDesc) => {
      let findIt = false
      if (node.name.indexOf(filter) !== -1) {
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
