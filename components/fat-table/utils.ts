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
        keys.push(item[idKey])
        if (item.children) {
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

export function filterDataSource<T extends { children?: T[]; parent?: T }>(
  data: T[],
  idKey: string,
  key: string,
  value: string,
  expandedKeys: string[],
) {
  return data.map(org => {
    // @ts-ignore: 进行一遍浅复制
    const current = { ...org }
    let findit = false
    if (current[key].indexOf(value) !== -1) {
      findit = true
      current[key] = current[key].replace(
        value,
        `<span class="matched">${value}</span>`,
      )
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

      if (!findit && len !== expandedKeys.length) {
        findit = true
      }
    }

    if (findit) {
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
