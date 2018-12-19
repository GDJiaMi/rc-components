import React from 'react'
import ReactDOM from 'react-dom'
import { RouteComponentProps, withRouter } from 'react-router'
import H from 'history'
import { TitleDesc, ContextValue } from './type'
import debounce from 'lodash/debounce'

export interface ProviderProps {
  /**
   * 自定义title格式化字符串. 由于title的children类型为React.ReactNode, 而不是字符串格式化. 所以需要
   * 一个格式化器进行格式化，默认实现是获取dom元素的innerText属性
   */
  titleFormatter?: (titles: TitleDesc[]) => string
  /**
   * debug 模式
   * @default false
   */
  debug?: boolean
}

export interface InnerProviderProps
  extends ProviderProps,
    RouteComponentProps<{}> {}

export const Context = React.createContext<ContextValue>({
  pushTitle: (t: TitleDesc) => {},
  popTitle: (t: TitleDesc) => {},
  updateTitle: (t: TitleDesc) => {},
  titles: [] as TitleDesc[],
  location: {} as H.Location,
})

/**
 * Provider 保存title元数据
 */
export class InnerProvider extends React.Component<
  InnerProviderProps,
  ContextValue
> {
  public static getDerivedStateFromProps(
    props: InnerProviderProps,
    state: ContextValue,
  ) {
    if (props.location != state.location) {
      return { location: props.location }
    }
    return null
  }
  private el = document.createElement('div')

  public constructor(props: InnerProviderProps) {
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

const InnerProviderWithRouter = withRouter(InnerProvider)

export default function Provider(props: ProviderProps) {
  return <InnerProviderWithRouter {...props} />
}
