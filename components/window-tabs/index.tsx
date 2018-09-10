/**
 * 包含所有打开的窗口
 */
import React from 'react'
import { withRouter, RouteComponentProps, Link } from 'react-router-dom'
import Scrollbars from 'react-custom-scrollbars'
import memoize from 'lodash/memoize'
import Icon from 'antd/lib/icon'

export interface TabsProps extends RouteComponentProps<{}> {
  persistOnSession?: boolean
}

interface TabDesc {
  key: string
  title: React.ReactNode
  url: string
}

interface State {
  tabs: TabDesc[]
}

const style = { height: 38, zIndex: 9, width: '100%', backgroundColor: 'white' }

export class WindowTabs extends React.Component<TabsProps, State> {
  public static defaultProps = {
    persistOnSession: true,
  }

  public state: State = {
    tabs: [],
  }

  private titleObserver: MutationObserver
  private scrollbar = React.createRef<Scrollbars>()

  public shouldComponentUpdate(nextProps: TabsProps, nextState: State) {
    if (
      nextProps.location !== this.props.location ||
      nextState.tabs !== this.state.tabs
    ) {
      return true
    }
    return false
  }

  public componentDidMount() {
    const title = document.getElementsByTagName('title')
    this.titleObserver = new MutationObserver(mutations => {
      const location = this.props.location
      const tabs = [...this.state.tabs]
      const index = tabs.findIndex(t => t.key === location.pathname)
      if (index !== -1) {
        tabs[index].title = (mutations[0].target as HTMLTitleElement).innerText
        this.updateTabs(tabs)
      }
    })

    this.titleObserver.observe(title[0], {
      subtree: true,
      childList: true,
      characterData: true,
    })

    // 初始化窗口
    const location = this.props.location
    if (this.props.persistOnSession) {
      const data = window.sessionStorage.getItem('__windows-tabs__')
      if (data) {
        this.setState({ tabs: JSON.parse(data) }, () => {
          this.update()
        })
        return
      }
    }

    this.updateTabs([
      {
        key: location.pathname,
        title: this.getTitle(),
        url: this.getUrl(),
      },
    ])
  }

  public componentDidUpdate(prevProps: TabsProps) {
    if (this.props.location !== prevProps.location) {
      // 更新
      this.update()
    }
  }

  public componentWillUnmount() {
    this.titleObserver.disconnect()
  }

  public render() {
    const location = this.props.location
    return (
      <Scrollbars
        className="jm-window-tabs-wrapper"
        style={style}
        autoHide
        ref={this.scrollbar}
        onWheel={this.handleScrollWheel}
      >
        <div className="jm-window-tabs">
          {this.state.tabs.map(k => (
            <Link
              to={k.url}
              id={`jm-window-tab__${k.key}`}
              className={`jm-window-tab ${
                location.pathname === k.key ? 'active' : ''
              }`}
              key={k.key}
            >
              <div className="jm-window-tab-content">{k.title}</div>
              <Icon
                className="jm-window-tab-close"
                type="close"
                onClick={this.remove(k.key)}
              />
            </Link>
          ))}
        </div>
      </Scrollbars>
    )
  }

  private handleScrollWheel = (evt: React.WheelEvent<any>) => {
    const currentScollDelta = this.scrollbar.current!.getScrollLeft()
    this.scrollbar.current!.scrollLeft(currentScollDelta + evt.deltaY)
  }

  private remove = memoize((key: string) => {
    return (evt: React.MouseEvent) => {
      evt.preventDefault()
      evt.stopPropagation()
      const location = this.props.location
      const history = this.props.history
      const tabs = [...this.state.tabs]
      const index = tabs.findIndex(t => t.key === key)
      if (index !== -1) {
        tabs.splice(index, 1)
        this.updateTabs(tabs)

        // 当前tab
        if (location.pathname === key) {
          // 激活上一个tab
          if (index > 0) {
            const nextActiveTab = tabs[index - 1]
            history.replace(nextActiveTab.url)
          } else if (tabs.length) {
            // 删除第一个, 激活第二个
            const nextActiveTab = tabs[0]
            history.replace(nextActiveTab.url)
          } else {
            if (key === '/') {
              return
            }

            // 只剩最后一个, 跳到首页
            history.replace('/')
          }
        }
      }
    }
  })

  private update() {
    const location = this.props.location
    const key = location.pathname
    const url = this.getUrl()
    const index = this.state.tabs.findIndex(t => t.key === key)
    if (index !== -1) {
      const tabs = [...this.state.tabs]
      const title = tabs[index]
      title.url = url
      this.updateTabs(tabs)
      return
    }

    this.updateTabs([
      ...this.state.tabs,
      {
        key,
        url,
        title: this.getTitle(),
      },
    ])
  }

  private updateTabs = (tabs: TabDesc[]) => {
    this.setState({ tabs }, () => {
      if (this.props.persistOnSession) {
        window.sessionStorage.setItem('__windows-tabs__', JSON.stringify(tabs))
      }

      // focus
      window.requestAnimationFrame(() => {
        const active = document.getElementById(
          `jm-window-tab__${this.props.location.pathname}`,
        )
        if (active) {
          const offsetLeft = active.offsetLeft
          this.scrollbar.current!.scrollLeft(offsetLeft)
        }
      })
    })
  }

  private getTitle() {
    return document.title
  }

  private getUrl() {
    const location = this.props.location
    return `${location.pathname}${location.search}${location.hash}`
  }
}

export default withRouter(WindowTabs)
