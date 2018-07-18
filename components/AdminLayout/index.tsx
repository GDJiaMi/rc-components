/**
 * 工作宝管理后台顶层布局
 */
import React, { HTMLAttributes } from 'react'
import { Link as _Link } from 'react-router-dom'
import classnames from 'classnames'
import Menu from 'antd/lib/menu'
import Icon from 'antd/lib/icon'
import Dropdown from 'antd/lib/dropdown'

export type LinkComponent = typeof _Link
export interface MenuConfig {
  path: string
  icon: string
  title: string
}

export interface AdminLayoutProps {
  children: React.ReactNode
  logo?: string
  siteName?: string
  title?: string
  indexLink?: string
  menus?: MenuConfig[]
  path?: string
  avatar?: string
  userName?: string
  Link: LinkComponent
  dropdown?: React.ReactNode
}

export interface State {
  collapsed: boolean
}

// TODO: createComponent
function HeaderBar(props: HTMLAttributes<HTMLDivElement>) {
  const { className, ...other } = props
  return <div className={`jm-header-bar ${className || ''}`} {...other} />
}

function View(props: HTMLAttributes<HTMLDivElement>) {
  const { className, ...other } = props
  return <div className={`jm-scroll-view ${className || ''}`} {...other} />
}

function Body(props: HTMLAttributes<HTMLDivElement>) {
  const { className, ...other } = props
  return <div className={`jm-body ${className || ''}`} {...other} />
}

export default class AdminLayout extends React.Component<
  AdminLayoutProps,
  State
> {
  public static HeaderBar = HeaderBar
  public static View = View
  public static Body = Body
  public state: State = {
    collapsed: false,
  }
  public render() {
    const {
      Link,
      logo,
      siteName = '工作宝',
      title,
      indexLink = '/',
      menus,
      avatar,
      path,
      userName,
      dropdown,
      children,
    } = this.props
    const { collapsed } = this.state

    return (
      <div className="jm-layout">
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
          >
            {!!menus &&
              !!menus.length &&
              menus.map(menu => (
                <Menu.Item key={menu.path}>
                  <Link to={menu.path}>
                    <Icon type={menu.icon} />
                    <span>{menu.title}</span>
                  </Link>
                </Menu.Item>
              ))}
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
            {!!dropdown && (
              <Dropdown overlay={dropdown}>
                <a className="jm-layout__actions">
                  <img className="jm-layout__avatar" src={avatar || logo} />
                  {userName || 'admin'}
                </a>
              </Dropdown>
            )}
          </header>
          <div className="jm-layout__body">{children}</div>
        </main>
      </div>
    )
  }

  private toggleCollaspsed = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    })
  }
}
