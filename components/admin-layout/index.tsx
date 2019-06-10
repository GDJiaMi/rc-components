/**
 * 工作宝管理后台顶层布局
 */
import React from 'react'
import { Link as _Link } from 'react-router-dom'
import classnames from 'classnames'
import Alert from 'antd/es/alert'
import Menu from 'antd/es/menu'
import Icon from 'antd/es/icon'
import Spin from 'antd/es/spin'
import { createComponent } from '../utils/common'

export type LinkComponent = typeof _Link
export interface MenuConfig {
  path?: string
  icon?: string | React.ReactElement<any>
  title: string
  // 点击事件
  onClick?: () => void
  children?: MenuConfig[]
}

export interface AdminLayoutProps {
  children: React.ReactNode
  logo?: string
  error?: Error
  // 冻结主页面
  freeze?: boolean
  siteName?: string
  title?: React.ReactNode
  indexLink?: string
  // 菜单项
  menus?: (() => Promise<MenuConfig[]>) | MenuConfig[]
  path?: string
  Link?: LinkComponent
  after?: React.ReactNode
  /**
   * 是否记住折叠状态
   */
  persistCollapsed?: boolean
}

interface State {
  collapsed: boolean
  openKeys: string[]
  menuLoading?: boolean
  finalMenus?: MenuConfig[]
  menuError?: Error
}

const COLLAPSED_KEY = '__admin_layout__collapsed'

export default class AdminLayout extends React.Component<
  AdminLayoutProps,
  State
> {
  public static HeaderBar = createComponent('jm-header-bar')
  public static View = createComponent('jm-scroll-view')
  public static Body = createComponent('jm-body')
  public static Action = createComponent('jm-layout__action')
  public static Footer = createComponent('jm-footer')
  public static Avatar = createComponent<
    React.ImgHTMLAttributes<HTMLImageElement>
  >('jm-layout__avatar', 'img')
  public static defaultProps = {
    persistCollapsed: true,
  }

  public state: State = {
    collapsed: false,
    openKeys: [],
  }

  public componentDidMount() {
    if (this.props.persistCollapsed) {
      const collapsed = window.localStorage.getItem(COLLAPSED_KEY)
      if (collapsed === 'true') {
        this.setState({ collapsed: true })
      }
    }

    if (typeof this.props.menus === 'function') {
      this.loadMenu()
    }
  }

  public render() {
    const {
      Link = _Link,
      logo,
      siteName = '工作宝',
      title,
      indexLink = '/',
      error,
      after,
      freeze,
      children,
    } = this.props
    const { collapsed } = this.state

    return (
      <div className="jm-layout">
        {!!error && (
          <Alert
            showIcon
            className="jm-layout__error"
            type="warning"
            banner
            message={error.message}
          />
        )}
        <main className={classnames('jm-layout__main', { freeze })}>
          <nav className={classnames('jm-layout__nav', { collapsed })}>
            <Link
              className={classnames('jm-layout__logo', { collapsed })}
              to={indexLink}
            >
              {!!logo && <img alt="logo" src={logo} />}
              <span title={siteName}>{siteName}</span>
            </Link>
            {this.renderMenus()}
          </nav>
          <main className="jm-layout__body">
            <header className="jm-layout__header">
              <div>
                <Icon
                  className="jm-layout__trigger"
                  type={collapsed ? 'menu-unfold' : 'menu-fold'}
                  onClick={this.toggleCollapsed}
                />
                <span className="jm-layout__title">{title}</span>
              </div>
              <div className="jm-layout__right">{after}</div>
            </header>
            <div className="jm-layout__body">{children}</div>
          </main>
        </main>
      </div>
    )
  }

  private renderMenus = () => {
    const { menus, path } = this.props
    const { openKeys, collapsed, menuError, finalMenus } = this.state
    const lazyLoading = typeof menus === 'function'
    const _menus = lazyLoading ? finalMenus : (menus as MenuConfig[])

    if (lazyLoading && menuError) {
      return (
        <div className="jm-layout__nav-menu">
          <Alert
            banner
            message={
              <span>
                菜单加载失败: {menuError.message},{' '}
                <a onClick={this.loadMenu}>重试</a>
              </span>
            }
          />
        </div>
      )
    } else if (lazyLoading && finalMenus == null) {
      return (
        <div className="jm-layout__nav-menu">
          <Spin tip="加载中...">
            <div style={{ width: '100%', height: 200 }} />
          </Spin>
        </div>
      )
    }

    return (
      <Menu
        className="jm-layout__nav-menu"
        theme="dark"
        inlineCollapsed={collapsed}
        mode="inline"
        selectedKeys={path != null ? [path] : undefined}
        defaultOpenKeys={
          !!_menus && !!_menus.length && path != null && !openKeys.length
            ? this.resolveOpenKeys(_menus, path)
            : openKeys
        }
        onOpenChange={(openKeys: string[]) => {
          this.setState({ openKeys })
        }}
      >
        {!!_menus && !!_menus.length && this.renderMenu(_menus)}
      </Menu>
    )
  }

  private loadMenu = async () => {
    if (typeof this.props.menus !== 'function') {
      return
    }
    try {
      this.setState({ menuLoading: true, menuError: undefined })
      const menus = await this.props.menus()
      this.setState({ finalMenus: menus })
    } catch (err) {
      this.setState({ menuError: err })
    } finally {
      this.setState({ menuLoading: false })
    }
  }

  private resolveOpenKeys = (menus: MenuConfig[], path: string) => {
    const tmpKeys: string[] = []
    const parentKeys: string[] = []
    this._resolveOpenKeys(menus, parentKeys, tmpKeys, path)
    return tmpKeys.length ? tmpKeys : [path]
  }

  private _resolveOpenKeys = (
    menus: MenuConfig[],
    parentKeys: string[],
    openKeys: string[],
    path: string,
  ) => {
    menus.forEach(menu => {
      if (!openKeys.length) {
        if (menu.path === path) {
          if (parentKeys.length < 1) {
            openKeys.push(menu.path)
          } else {
            parentKeys.forEach(key => {
              openKeys.push(key)
            })
          }
        }
        if (menu.children && menu.children.length) {
          const tmpMenuPath = [...parentKeys]
          if (menu.path) {
            tmpMenuPath.push(menu.path)
          }
          this._resolveOpenKeys(menu.children, tmpMenuPath, openKeys, path)
        }
      }
    })
  }

  private renderMenu = (menus: MenuConfig[]): React.ReactNode[] => {
    return menus.map(menu =>
      menu.children && menu.children.length ? (
        <Menu.SubMenu key={menu.path} title={this.renderMenuLink(menu)}>
          {this.renderMenu(menu.children)}
        </Menu.SubMenu>
      ) : (
        <Menu.Item key={menu.path} onClick={menu.onClick}>
          {this.renderMenuLink(menu)}
        </Menu.Item>
      ),
    )
  }

  private renderMenuLink = (menu: MenuConfig) => {
    const { Link = _Link } = this.props
    const icon =
      typeof menu.icon === 'string' ? <Icon type={menu.icon} /> : menu.icon

    if (menu.path == null || menu.onClick) {
      return (
        <span>
          {!!icon && icon}
          <span>{menu.title}</span>
        </span>
      )
    } else {
      return (
        <Link to={menu.path}>
          {!!icon && icon}
          <span>{menu.title}</span>
        </Link>
      )
    }
  }

  private toggleCollapsed = () => {
    this.setState(
      {
        collapsed: !this.state.collapsed,
      },
      () => {
        if (this.props.persistCollapsed) {
          window.localStorage.setItem(COLLAPSED_KEY, '' + this.state.collapsed)
        }
      },
    )
  }
}
