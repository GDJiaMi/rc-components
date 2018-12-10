/**
 * title 设置和展示, 并且支持面包屑
 */
import React from 'react'
import ReactDOM from 'react-dom'
import Breadcrumb, { BreadcrumbProps } from 'antd/es/breadcrumb'
import {
  Route as IRoute,
  RouteProps,
  withRouter,
  matchPath,
  RouteComponentProps,
} from 'react-router'
import { Location } from 'history'
import { Link } from 'react-router-dom'
import path from 'path'
import debounce from 'lodash/debounce'

export interface TitleDesc {
  id: string
  link?: string
  content: React.ReactNode
}

export interface ContextValue {
  pushTitle: (t: TitleDesc) => void
  popTitle: (t: TitleDesc) => void
  updateTitle: (t: TitleDesc) => void
  titles: TitleDesc[]
  location: Location
}

export const Context = React.createContext<ContextValue>({
  pushTitle: (t: TitleDesc) => {},
  popTitle: (t: TitleDesc) => {},
  updateTitle: (t: TitleDesc) => {},
  titles: [] as TitleDesc[],
  location: {} as Location,
})

export interface ProviderProps extends RouteComponentProps<{}> {
  titleFormatter?: (titles: TitleDesc[]) => string
  debug?: boolean
}

/**
 * Provider 保存title元数据
 */
class InnerProvider extends React.Component<ProviderProps, ContextValue> {
  public static getDerivedStateFromProps(
    props: ProviderProps,
    state: ContextValue,
  ) {
    if (props.location != state.location) {
      return { location: props.location }
    }
    return null
  }
  private el = document.createElement('div')

  public constructor(props: ProviderProps) {
    super(props)
    this.state = {
      titles: [] as TitleDesc[],
      pushTitle: this.setTitle,
      popTitle: this.popTitle,
      updateTitle: this.updateTitle,
      location: this.props.location,
    }
  }

  public render() {
    const titles = this.state.titles
    const title = titles[titles.length - 1]
    return (
      <Context.Provider value={this.state}>
        {ReactDOM.createPortal(title && title.content, this.el)}
        {this.props.children}
      </Context.Provider>
    )
  }

  private updateDocumentTitle = debounce(() => {
    const formatter = this.props.titleFormatter
    const title = formatter ? formatter(this.state.titles) : this.el.innerText
    document.title = title
  }, 100)

  /**
   * 更新title内容
   */
  private updateTitle = (t: TitleDesc) => {
    const titles = this.state.titles
    const index = titles.findIndex(i => i.id === t.id)
    if (index !== -1) {
      titles.splice(index, 1, t)
      if (this.props.debug) {
        console.log('update', [...titles])
      }
      this.setState({ titles }, this.updateDocumentTitle)
    } else {
      // 不存在，可能被误删了。因为数据是先增加后删的，对于使用路由变量的组件，路由变化后可能导致
      // 重新挂载，这时候就会导致误删
      this.setTitle(t)
    }
  }

  // 数据是先增后删的
  private popTitle = (t: TitleDesc) => {
    const titles = this.state.titles
    const index = titles.findIndex(i => i.id === t.id)
    if (index !== -1) {
      titles.splice(index, 1)
      if (this.props.debug) {
        console.log('pop', [...titles])
      }
      this.setState({ titles }, this.updateDocumentTitle)
    }
  }

  private setTitle = (t: TitleDesc) => {
    const titles = this.state.titles
    const index = titles.findIndex(i => i.id === t.id)
    if (index !== -1) {
      titles.splice(index, 1)
      titles.push(t)
      if (this.props.debug) {
        console.log('reuse', [...titles])
      }
    } else {
      titles.push(t)
      if (this.props.debug) {
        console.log('push', [...titles])
      }
    }
    this.setState({ titles }, this.updateDocumentTitle)
  }
}

export const Provider = withRouter(InnerProvider)

interface InnerTitleProps {
  pushTitle: (t: TitleDesc) => void
  popTitle: (t: TitleDesc) => void
  updateTitle: (t: TitleDesc) => void
  link?: string
  exact?: boolean
  strict?: boolean
  location: Location
  dontTranformLink?: boolean
  titles: TitleDesc[]
  children: React.ReactNode
}

let uid = 0
// 保证同一个位置的Title始终重用一个uid
const uidmap: { [key: string]: string } = {}
class InnerTitle extends React.Component<InnerTitleProps> {
  private key: string
  private link: string

  public componentWillMount() {
    const {
      link,
      location,
      exact,
      strict,
      dontTranformLink,
      titles,
    } = this.props

    if (link) {
      // '/' 可能存在多个, 所以为他们创建多个
      if (link === '/') {
        this.key = String(uid++)
      } else if (link in uidmap) {
        this.key = uidmap[link]
      }

      if (dontTranformLink || path.isAbsolute(link)) {
        // 不要转换，一般是绝对路径
        this.link = link
        if (this.key == null) {
          this.key = uidmap[link] = String(uid++)
        }
      } else {
        // 相对路径
        let absLink: string = ''
        for (let i = titles.length - 1; i >= 0; i--) {
          const title = titles[i]
          if (title.link && path.isAbsolute(title.link)) {
            absLink = path.join(title.link, link)
            break
          }
        }

        if (absLink === '') {
          absLink = location.pathname
        }

        if (this.key == null) {
          this.key = uidmap[absLink] = String(uid++)
        }

        // 相对路径
        const match = matchPath(location.pathname, {
          path: absLink,
          exact,
          strict,
        })
        if (match != null) {
          // 尝试相对路径
          this.link = match.url
        }
      }
    } else {
      this.key = String(uid++)
    }

    this.props.pushTitle({
      id: this.key,
      link: this.link,
      content: this.props.children,
    })
  }

  public componentWillReceiveProps(nextProps: InnerTitleProps) {
    if (this.props.children !== nextProps.children) {
      this.props.updateTitle({
        id: this.key,
        link: this.link,
        content: nextProps.children,
      })
    }
  }

  public shouldComponentUpdate(nextProps: InnerTitleProps) {
    return this.props.children !== nextProps.children
  }

  public componentWillUnmount() {
    this.props.popTitle({
      id: this.key,
      link: this.link,
      content: this.props.children,
    })
  }

  public render() {
    return null
  }
}

export interface ExtendedRouteProps extends RouteProps {
  title?:
    | React.ReactChild
    | ((props: RouteComponentProps<any>) => React.ReactNode)
  remountOnChange?: boolean
}

/**
 * 包装`react-router`组件，支持声明title
 */
export class Route extends React.Component<ExtendedRouteProps> {
  public render() {
    const {
      title,
      remountOnChange,
      component,
      render,
      children,
      ...other
    } = this.props
    return (
      <IRoute
        {...other}
        render={props => (
          <>
            {!!title && (
              <Title
                link={props.match.url}
                key={props.match.url}
                dontTranformLink
              >
                {typeof title === 'function' ? title(props) : title}
              </Title>
            )}
            <React.Fragment
              key={remountOnChange ? props.location.pathname : undefined}
            >
              {component != null
                ? React.createElement(component as any, props)
                : render != null
                ? render(props)
                : typeof children === 'function'
                ? (children as (props: ExtendedRouteProps) => React.ReactNode)(
                    props,
                  )
                : children}
            </React.Fragment>
          </>
        )}
      />
    )
  }
}

/**
 * 展示title
 */
export function Display(
  props: {
    inline?: boolean
    breadcrumb?: boolean
    renderItems?: (
      desc: TitleDesc,
      index: number,
      titles: TitleDesc[],
    ) => React.ReactNode
  } & BreadcrumbProps,
) {
  const { breadcrumb, renderItems, className, inline, ...other } = props
  return (
    <Context.Consumer>
      {({ titles }) => {
        const lastTitle = titles[titles.length - 1]
        return breadcrumb ? (
          renderItems != null ? (
            titles.map(
              (t, index) => renderItems && renderItems(t, index, titles),
            )
          ) : (
            <Breadcrumb
              {...other}
              className={`${className || ''} ${inline ? 'inline' : ''}`}
            >
              {titles.map((t, index) => (
                <Breadcrumb.Item key={t.id}>
                  {index === titles.length - 1 || t.link == null ? (
                    t.content
                  ) : (
                    <Link to={t.link}>{t.content}</Link>
                  )}
                </Breadcrumb.Item>
              ))}
            </Breadcrumb>
          )
        ) : (
          (lastTitle && lastTitle.content) || ''
        )
      }}
    </Context.Consumer>
  )
}

/**
 * 声明当前title
 */
export default class Title extends React.PureComponent<{
  children: React.ReactNode
  link?: string
  exact?: boolean
  strict?: boolean
  dontTranformLink?: boolean
}> {
  public static Provider = Provider
  public static Route = Route
  public static Display = Display
  public static Context = Context
  public render() {
    const props = this.props
    return (
      <Context.Consumer>
        {injectProps => <InnerTitle {...injectProps} {...props} />}
      </Context.Consumer>
    )
  }
}
