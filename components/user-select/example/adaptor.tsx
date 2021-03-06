import Provider, {
  Adaptor,
  UserDesc,
  TenementDesc,
  DepartmentDesc,
  DepartmentSearchResult,
} from '../Provider'

function delay(time: number) {
  return new Promise(res => window.setTimeout(res, time))
}

const adaptor: Adaptor = {
  async getDepartmentUsers(tenementId, departmentId, page, pageSize) {
    const list: UserDesc[] = []
    if (page === 3) {
      throw new Error('模拟抛出异常')
    }
    for (let i = 0; i < pageSize; i++) {
      list.push({
        id: `${tenementId}-${departmentId}-${page}-${i}`,
        name: `${tenementId}-${departmentId}-${page}-${i}`,
        mobile: `1234554${i}`,
        extra: null,
      })
    }
    return {
      items: list,
      total: 3 * pageSize,
    }
  },

  async getDepartmentChildren(tenementId: string, departmentId: string) {
    const list: DepartmentDesc[] = []
    for (let i = 0; i < 3; i++) {
      list.push({
        id: `${departmentId}-${i}`,
        name: `${departmentId}-${i}`,
        userCount: '18',
        open: true,
      })
    }

    return list
  },

  async getDepartmentTree(tenementId) {
    return {
      id: `${tenementId}-root`,
      name: 'root',
      userCount: '0',
      open: true,
      children: [
        {
          id: `${tenementId}-1`,
          name: '二级部门1',
          userCount: '18',
          open: true,
          children: [
            {
              id: `${tenementId}-1-1`,
              name: '三级部门1',
              userCount: '18',
              extra: null,
              children: [
                {
                  id: `${tenementId}-1-1-1`,
                  name: '四级部门1',
                  userCount: '18',
                  extra: null,
                  children: [
                    {
                      id: `${tenementId}-1-1-1-1`,
                      name: '五级部门1',
                      userCount: '18',
                      extra: null,
                      children: [
                        {
                          id: `${tenementId}-1-1-1-1-1`,
                          name: '六级部门1',
                          userCount: '18',
                          open: true,
                          extra: null,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
          extra: null,
        },
        {
          id: `${tenementId}-2`,
          name: '二级部门2',
          userCount: '18',
          extra: null,
          // 测试异步加载
          children: [],
        },
        {
          id: `${tenementId}-3`,
          name: '二级部门3',
          extra: null,
        },
      ],
      extra: null,
    }
  },

  async searchUser(query, page, pageSize) {
    const list: UserDesc[] = []
    if (page === 3 || query == '异常') {
      throw new Error('模拟抛出异常')
    }

    if (query === 'error') {
      throw new Error('模拟抛出异常')
    }

    if (query === 'notfound') {
      return {
        items: [],
        total: 0,
      }
    }

    for (let i = 0; i < pageSize; i++) {
      list.push({
        id: `${query}-${page}-${i}`,
        name: `${query}-${page}-${i}`,
        mobile: `1234554${i}`,
        extra: null,
      })
    }
    await delay(1000)
    return {
      items: list,
      total: 3 * pageSize,
    }
  },

  async searchDepartment(query, page, pageSize, tenementId) {
    if (page === 3 || query == '异常') {
      throw new Error('模拟抛出异常')
    }

    const list: DepartmentSearchResult[] = []
    for (let i = 0; i < pageSize; i++) {
      list.push({
        parentId: '1',
        id: i + '',
        leaf: i % 2 === 0,
        name: `${query}-${page}-${i}`,
      })
    }

    await delay(1000)

    return { items: list, total: 3 * pageSize }
  },

  async searchTenement(query, page, pageSize) {
    const list: TenementDesc[] = []
    if (page === 3 || query === '异常') {
      throw new Error('模拟抛出异常')
    }
    if (query == '未找到') {
      return { items: [], total: 0 }
    }
    for (let i = 0; i < pageSize; i++) {
      list.push({
        id: `${query}-${page}-${i}`,
        name: `${query}-${page}-${i}`,
        extra: null,
      })
    }
    return {
      items: list,
      total: 3 * pageSize,
    }
  },
}

export default adaptor
