/**
 * 查询字符串相关操作
 */
import React from 'react'
import omit from 'lodash/omit'
import { RouteComponentProps } from 'react-router'
import qs from 'qs'
import QueryGetter from './QueryGetter'
import withRouter from '../utils/withRouter'

export type QuerySetter = (key: string, value: any) => QuerySetter
export { QueryGetter }

export interface QueryContextValue {
  value: any
  set(namespace: string, query: object, ...omited: string[]): void
  set(query: object, ...omited: string[]): void
  get(namespace?: string): any
  setter(namespace?: string): QuerySetter
  getter(namespace?: string): QueryGetter
  clear(namespace?: string): void
}

export interface QueryComponentProps {
  search: QueryContextValue
}

interface Props extends RouteComponentProps<{}> {}
interface State extends QueryComponentProps {
  rawSearch: string
}

const noop = (...args: any[]): any => {
  throw new Error('Query.Provider 未挂载')
}

export const QueryContext = React.createContext<QueryContextValue>({
  value: {},
  set: noop,
  get: noop,
  setter: noop,
  getter: noop,
  clear: noop,
})

export class Provider extends React.PureComponent<Props, State> {
  public constructor(props: Props) {
    super(props)
    this.state = {
      search: {
        value: {},
        clear: this.clear.bind(this),
        setter: this.setter.bind(this),
        getter: this.getter.bind(this),
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
    return (
      <QueryContext.Provider value={this.state.search}>
        {this.props.children}
      </QueryContext.Provider>
    )
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
  private getter(namespace?: string) {
    return new QueryGetter(filterNamespace(namespace, this.state.search.value))
  }

  private get(namespace?: string) {
    return filterNamespace(namespace, this.state.search.value)
  }

  private setter(namespace: string = '') {
    const self = (key: string, value: any) => {
      this.set(namespace, { [key]: value })
      return self
    }
    return self
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
export default withRouter(Provider)
