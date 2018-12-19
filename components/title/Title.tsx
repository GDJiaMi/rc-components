import React from 'react'
import { matchPath } from 'react-router'
import H from 'history'
import path from 'path'
import { TitleDesc } from './type'
import Provider, { Context } from './Provider'
import Route from './Route'
import Display from './Display'

export interface InnerTitleProps {
  pushTitle: (t: TitleDesc) => void
  popTitle: (t: TitleDesc) => void
  updateTitle: (t: TitleDesc) => void
  link?: string
  exact?: boolean
  strict?: boolean
  location: H.Location
  dontTransformLink?: boolean
  titles: TitleDesc[]
  children: React.ReactNode
}

let uid = 0
// 保证同一个位置的Title始终重用一个uid
const uidmap: { [key: string]: string } = {}

export class InnerTitle extends React.Component<InnerTitleProps> {
  private key: string
  private link: string

  public componentWillMount() {
    const {
      link,
      location,
      exact,
      strict,
      dontTransformLink,
      titles,
    } = this.props

    if (link) {
      // '/' 可能存在多个, 所以为他们创建多个
      if (link === '/') {
        this.key = String(uid++)
      } else if (link in uidmap) {
        this.key = uidmap[link]
      }

      if (dontTransformLink || path.isAbsolute(link)) {
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

export interface TitleProps {
  /**
   * 标题内容
   */
  children: React.ReactNode
  /**
   * 指定链接，可以为绝对路径和相对路径，相对路径将相对于上一层Title指定的link属性。 可以包含路由变量, 如`:id`,
   * 将根据当前路由进行自动匹配
   */
  link?: string
  /**
   * Title内部使用react-router的matchPath函数来匹配路由变量，这个选项对应matchPath的exact选项
   */
  exact?: boolean
  /**
   * Title内部使用react-router的matchPath函数来匹配路由变量，这个选项对应matchPath的strict选项
   */
  strict?: boolean
  /**
   * @ignore 不要转换link属性
   */
  dontTransformLink?: boolean
}

/**
 * 声明当前title
 */
export default class Title extends React.PureComponent<TitleProps> {
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
