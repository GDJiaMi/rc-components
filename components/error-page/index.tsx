/**
 * 异常页面
 */
import React from 'react'

const unauthorized = require('./401.svg')
const forbidden = require('./403.svg')
const notFound = require('./404.svg')
const internalError = require('./500.svg')

interface ErrorPageInnerProps {
  icon: string
  title: string
  desc: string
  children?: React.ReactNode
}

function wrapIcon(icon: any) {
  return typeof icon === 'string' ? icon : icon.default
}

export class ErrorPageInner extends React.Component<ErrorPageInnerProps> {
  public render() {
    const { icon, title, desc, children } = this.props
    return (
      <div className="error-page">
        <img className="error-page__icon" src={icon} />
        <div className="error-page__body">
          <h1 className="error-page__title">{title}</h1>
          <p className="error-page__desc">{desc}</p>
          <footer className="error-page__footer">{children}</footer>
        </div>
      </div>
    )
  }
}

function NotFound(props: { children?: React.ReactNode }) {
  return (
    <ErrorPageInner
      icon={wrapIcon(notFound)}
      title="404"
      desc="抱歉， 你访问的页面不存在"
      children={props.children}
    />
  )
}

function Unauthorized(props: { children?: React.ReactNode }) {
  return (
    <ErrorPageInner
      icon={wrapIcon(unauthorized)}
      title="401"
      desc="抱歉， 请登录后操作"
      children={props.children}
    />
  )
}

function Forbidden(props: { children?: React.ReactNode }) {
  return (
    <ErrorPageInner
      icon={wrapIcon(forbidden)}
      title="403"
      desc="抱歉， 你无权访问该页面"
      children={props.children}
    />
  )
}

function InternalError(props: { children?: React.ReactNode }) {
  return (
    <ErrorPageInner
      icon={wrapIcon(internalError)}
      title="500"
      desc="服务器内部错误"
      children={props.children}
    />
  )
}

export default {
  Unauthorized,
  Forbidden,
  InternalError,
  NotFound,
}
