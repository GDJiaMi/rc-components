import immer from 'immer'

/**
 * 根据展开级别获取所有需要展开的key
 */
export function getExpandKeyByLevel<T extends { children?: T[] }>(
  data: T[],
  level: number,
  idKey: string,
) {
  let keys: string[] = []
  let groups: Array<T[]> | undefined = [data]
  for (let i = 0; i < level; i++) {
    if (groups.length === 0) {
      break
    }

    let tempGroups = groups
    groups = []
    for (let group of tempGroups) {
      for (let item of group) {
        if (Array.isArray(item.children) && item.children.length !== 0) {
          keys.push(item[idKey])
          groups.push(item.children)
        }
      }
    }
  }

  return keys
}

export function isTree<T extends { children?: T[] }>(data: T[]) {
  return data.some(i => i.children != null)
}

export function searchAndMatch(value: string, q: string) {}

export function filterDataSource<T extends { children?: T[]; parent?: T }>(
  data: T[],
  idKey: string,
  key: string,
  value: string,
  expandedKeys: string[],
) {
  return data.map(org => {
    let findIt = false
    const current = { ...org }
    const content: string = current[key]
    const q = new RegExp(value, 'i')
    const index = content.search(q)
    if (index !== -1) {
      findIt = true
      current[key] =
        content.substring(0, index) +
        `<span class="matched">${content.substring(
          index,
          index + value.length,
        )}</span>` +
        content.substring(index + value.length)
    }

    if (current.children) {
      let len = expandedKeys.length
      current.children = filterDataSource(
        current.children,
        idKey,
        key,
        value,
        expandedKeys,
      )

      if (!findIt && len !== expandedKeys.length) {
        findIt = true
      }
    }

    if (findIt) {
      expandedKeys.push(current[idKey])
    }

    return current
  })
}

export function findAndReplace<T extends { children?: T[] }>(
  data: T[],
  newData: T,
  idKey: string,
) {
  const _findAndReplace = (data: T[], newData: T, idKey: string) => {
    for (let i = 0; i < data.length; i++) {
      if (data[i][idKey] === newData[idKey]) {
        data.splice(i, 1, newData)
        return true
      }

      if (data[i].children != null) {
        if (_findAndReplace(data[i].children!, newData, idKey)) {
          return true
        }
      }
    }

    return false
  }

  return immer(data, state => {
    _findAndReplace(state as T[], newData, idKey)
  })
}

export function findAndReplaceWithReplacer<T extends { children?: T[] }>(
  data: T[],
  idKey: string,
  id: any,
  replacer: (item: T) => T,
) {
  const _findAndReplace = (data: T[]) => {
    for (let i = 0; i < data.length; i++) {
      if (data[i][idKey] === id) {
        const item = data[i]
        data.splice(i, 1, replacer(item))
        return true
      }

      if (data[i].children != null) {
        if (_findAndReplace(data[i].children!)) {
          return true
        }
      }
    }

    return false
  }

  return immer(data, state => {
    _findAndReplace(state as T[])
  })
}
