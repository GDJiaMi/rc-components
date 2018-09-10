/**
 * 底部操作栏, 用于长表单的页面放置表单按钮
 */
import React from 'react'

export interface FooterToolbarProps {
  left?: React.ReactNode
  children: React.ReactNode
}

export default class FooterToolbar extends React.PureComponent<
  FooterToolbarProps
> {
  public render() {
    return (
      <footer className="jm-footer-toolbar">
        <div className="jm-footer-toolbar__left">{this.props.left}</div>
        <div className="jm-footer-toolbar__right">{this.props.children}</div>
      </footer>
    )
  }
}
