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

export function filterDataSource<T extends { children?: T[]; parent?: T }>(
  data: T[],
  idKey: string,
  key: string,
  value: string,
  expandedKeys: string[],
) {
  // @ts-ignore: 进行一遍浅复制
  return data
    .map<T>(i => ({ ...i }))
    .filter(current => {
      let findit = false
      if (current[key].indexOf(value) !== -1) {
        findit = true
        current[key] = current[key].replace(
          value,
          `<span class="matched">${value}</span>`,
        )
      }

      if (current.children) {
        current.children = filterDataSource(
          current.children,
          idKey,
          key,
          value,
          expandedKeys,
        )
        if (current.children.length) {
          findit = true
          expandedKeys.push(current[idKey])
        }
      }

      return findit
    })
}
