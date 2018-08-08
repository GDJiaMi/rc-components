/**
 * 二级页面返回
 */
import React, { CSSProperties } from 'react'
import { withRouter, RouteComponentProps } from 'react-router'

export interface BackBarProps extends RouteComponentProps<{}> {
  link?: string
  replace?: boolean
  children?: React.ReactNode
  style?: CSSProperties
  className?: string
}

class BackBar extends React.Component<BackBarProps> {
  public render() {
    return (
      <div
        className={`jm-back jm-header-bar ${this.props.className || ''}`}
        style={this.props.style}
      >
        <div className="jm-back__button" onClick={this.handleClick}>
          <span className="jm-back__icon" />
          <span>返回</span>
        </div>
        {this.props.children}
      </div>
    )
  }

  private handleClick = () => {
    const { link, replace, history } = this.props
    if (link != null) {
      if (replace) {
        history.replace(link)
      } else {
        history.push(link)
      }
    } else {
      history.go(-1)
    }
  }
}

export default withRouter(BackBar)
