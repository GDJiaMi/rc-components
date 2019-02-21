export interface PathNode<T> {
  pos: string
  node: T
}

interface Node<T> {
  node?: PathNode<T>
  key: string
  children: { [key: string]: Node<T> }
}

/**
 * 由于聚合部门树的选中状态
 */
export class PathTree<T> {
  private tree: { [key: string]: Node<T> } = {}

  static normalizedPathNodes<T>(nodes: PathNode<T>[]) {
    const tree = new PathTree(nodes)
    return tree.generateCheckedNodes()
  }

  constructor(nodes: PathNode<T>[]) {
    this.buildTree(nodes)
  }

  public generateCheckedNodes() {
    const nodes: Node<T>[] = []
    this.traversal(this.tree, nodes)
    return nodes.map(n => n.node!)
  }

  private traversal(children: { [key: string]: Node<T> }, nodes: Node<T>[]) {
    Object.keys(children).forEach(key => {
      const node = children[key]
      if (node.node) {
        nodes.push(node)
      } else {
        this.traversal(node.children, nodes)
      }
    })
  }

  private buildTree(nodes: PathNode<T>[]) {
    for (const node of nodes) {
      const path = node.pos.split('-')
      this.insertIntoTree(path, node)
    }
  }

  private insertIntoTree(path: string[], node: PathNode<T>) {
    let parent = this.tree
    let currentNode: Node<T> | undefined
    for (const key of path) {
      if (parent[key]) {
        // 已存在顶层父节点, 所有子节点应该是选中状态
        if (parent[key].node) {
          return
        }
        currentNode = parent[key]
        parent = parent[key].children
      } else {
        currentNode = parent[key] = {
          key,
          children: {},
        }
        parent = parent[key].children
      }
    }

    currentNode!.node = node
  }
}
