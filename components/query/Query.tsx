/**
 * 注入查询字符串，以及查询字符串相关方法
 */
import React from 'react'
import omit from 'lodash/omit'
import { withRouter, RouteComponentProps } from 'react-router'
import qs from 'qs'
import QueryGetter from './QueryGetter'

export interface QueryComponentProps {
  search: {
    value: object
    set(namespace: string, query: object, ...omited: string[]): void
    set(query: object, ...omited: string[]): void
    get(namespace?: string): QueryGetter
    clear(namespace?: string): void
  }
}

export interface QueryProps {
  children: (props: QueryComponentProps) => React.ReactNode
}

export { QueryGetter }

interface Props extends QueryProps, RouteComponentProps<{}> {}
interface State extends QueryComponentProps {
  rawSearch: string
}

export class Query extends React.PureComponent<Props, State> {
  public constructor(props: Props) {
    super(props)
    this.state = {
      search: {
        value: {},
        clear: this.clear.bind(this),
        get: this.get.bind(this),
        set: this.set.bind(this),
      },
      rawSearch: '',
    }
  }

  public static getDerivedStateFromProps(props: Props, state: State) {
    if (props.location.search !== state.rawSearch) {
      return {
        rawSearch: props.location.search,
        search: {
          ...state.search,
          value: getSearchParams(props.location.search),
        },
      }
    }
    return null
  }

  public render() {
    return this.props.children(this.state as QueryComponentProps)
  }

  private clear = (namespace?: string) => {
    const history = this.props.history
    const location = history.location
    let res: object

    if (!namespace) {
      history.push({
        ...location,
        search: '',
        state: {
          changeBySerial: true,
        },
      })
      return
    }

    res = this.state.search.value
    const clearedParams = { ...res }
    for (let key in res) {
      if (res.hasOwnProperty(key) && key.startsWith(namespace + '-')) {
        delete clearedParams[key]
      }
    }

    const search = qs.stringify(clearedParams)
    history.push({
      ...location,
      search,
      state: {
        changeBySerial: true,
      },
    })
  }

  /**
   * 获取查询字符串
   */
  private get(namespace?: string) {
    return new QueryGetter(filterNamespace(namespace, this.state.search.value))
  }

  /**
   * 设置查询字符串
   */
  private set(namespace: string, query: object, ...omited: string[]): void
  private set(query: object, ...omited: string[]): void
  private set(
    namespaceOrQuery: string | object,
    queryOrOmited: object | string,
    ...omited: string[]
  ) {
    let namespace = ''
    let query = {}

    if (typeof namespaceOrQuery === 'string') {
      namespace = namespaceOrQuery
      query = queryOrOmited as object
    } else {
      query = namespaceOrQuery
      omited = [queryOrOmited as string].concat(omited)
    }

    const history = this.props.history
    const location = history.location
    query = omit(query, ...omited)

    // 添加namespace作为前缀
    query = applyNamespace(namespace, query)
    query = { ...this.state.search.value, ...query }

    const search = qs.stringify(query)
    history.push({
      ...location,
      search,
      state: {
        changeBySerial: true,
      },
    })
  }
}

export function getSearchParams(searchString: string) {
  return qs.parse(
    searchString[0] === '?' ? searchString.slice(1) : searchString,
  )
}

function applyNamespace(namespace: string, query: object): object {
  if (!namespace) {
    return query
  }

  const res = {}
  for (let key in query) {
    if (query.hasOwnProperty(key)) {
      res[`${namespace}-${key}`] = query[key]
    }
  }

  return res
}

function filterNamespace(namespace: string | undefined, query: object): object {
  if (!namespace) {
    return query
  }

  const res = {}
  for (let key in query) {
    if (query.hasOwnProperty(key) && key.startsWith(namespace + '-')) {
      res[key.split('-')[1]] = query[key]
    }
  }

  return res
}

// @ts-ignore
export default withRouter(Query)
