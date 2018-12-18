/**
 * 登录页面布局
 */
import React from 'react'
import { createComponent, overrideComponent } from '../utils/common'
import AInput from 'antd/es/input'
import AButton from 'antd/es/button'

export interface LayoutProps {
  background?: string
  logo?: string
  title: string
  footer?: React.ReactNode
  children?: React.ReactNode
}

//
export const defaultBackground = require('./bg.jpg')
export const defaultLogo = require('./logo.png')

export const Alert = createComponent('jm-login__alert')

// @ts-ignore propsType ValidationMap incompatible
export const Input = overrideComponent(AInput, {
  size: 'large',
})

// @ts-ignore
export const Button = overrideComponent(AButton, {
  size: 'large',
  type: 'primary',
  style: { width: '100%', marginTop: '1em' },
  htmlType: 'submit',
})

export default class Layout extends React.PureComponent<LayoutProps> {
  public static Alert = Alert
  public static Input = Input
  public static Button = Button

  public render() {
    const props = this.props
    return (
      <div
        className="jm-login__bg"
        style={{
          backgroundImage: `url(${props.background || defaultBackground})`,
        }}
      >
        <main className="jm-login__panel">
          <header className="jm-login__header">
            <img className="jm-login__logo" src={props.logo || defaultLogo} />
            <h1 className="jm-login__title">{props.title}</h1>
          </header>
          <div className="jm-login__body">{props.children}</div>
          <footer className="jm-login__footer">
            {props.footer || 'Powered by MyGZB'}
          </footer>
        </main>
      </div>
    )
  }
}
