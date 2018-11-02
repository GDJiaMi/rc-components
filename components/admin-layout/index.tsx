/**
 * 工作宝管理后台顶层布局
 */
import React from 'react'
import { Link as _Link } from 'react-router-dom'
import classnames from 'classnames'
import Alert from 'antd/lib/alert'
import Menu from 'antd/lib/menu'
import Icon from 'antd/lib/icon'
import { createComponent } from '../utils/common'

export type LinkComponent = typeof _Link
export interface MenuConfig {
  path?: string
  icon?: string
  title: string
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
  menus?: MenuConfig[]
  path?: string
  Link?: LinkComponent
  after?: React.ReactNode
}

interface State {
  collapsed: boolean
  openKeys: string[]
}

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

  public state: State = {
    collapsed: false,
    openKeys: [],
  }
  public render() {
    const {
      Link = _Link,
      logo,
      siteName = '工作宝',
      title,
      indexLink = '/',
      menus,
      path,
      error,
      after,
      freeze,
      children,
    } = this.props
    const { collapsed, openKeys } = this.state

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
              <span>{siteName}</span>
            </Link>
            <Menu
              className="jm-layout__nav-menu"
              theme="dark"
              inlineCollapsed={collapsed}
              mode="inline"
              selectedKeys={path != null ? [path] : undefined}
              defaultOpenKeys={
                !!menus && !!menus.length && path != null && !openKeys.length
                  ? this.resolveOpenKeys(menus, path)
                  : openKeys
              }
              // openKeys={openKeys}
              onOpenChange={(openKeys: string[]) => {
                this.setState({ openKeys })
              }}
            >
              {!!menus && !!menus.length && this.renderMenu(menus)}
            </Menu>
          </nav>
          <main className="jm-layout__body">
            <header className="jm-layout__header">
              <div>
                <Icon
                  className="jm-layout__trigger"
                  type={collapsed ? 'menu-unfold' : 'menu-fold'}
                  onClick={this.toggleCollaspsed}
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
    return menus.map(
      menu =>
        menu.children && menu.children.length ? (
          <Menu.SubMenu key={menu.path} title={this.renderMenuLink(menu)}>
            {this.renderMenu(menu.children)}
          </Menu.SubMenu>
        ) : (
          <Menu.Item key={menu.path}>{this.renderMenuLink(menu)}</Menu.Item>
        ),
    )
  }

  private renderMenuLink = (menu: MenuConfig) => {
    const { Link = _Link } = this.props
    if (menu.path == null) {
      return (
        <span>
          {!!menu.icon && <Icon type={menu.icon} />}
          <span>{menu.title}</span>
        </span>
      )
    } else {
      return (
        <Link to={menu.path}>
          {!!menu.icon && <Icon type={menu.icon} />}
          <span>{menu.title}</span>
        </Link>
      )
    }
  }

  private toggleCollaspsed = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    })
  }
}
