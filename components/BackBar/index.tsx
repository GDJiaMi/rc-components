/**
 * 二级页面返回
 */
import React from 'react'
import { History } from 'history'

export interface BackBarProps {
  link?: string
  replace?: boolean
  title?: string
  children?: React.ReactNode
}

export default function createBackBar({ history }: { history: History }) {
  return class BackBar extends React.Component<BackBarProps> {
    public render() {
      return (
        <div className="jm-back jm-header-bar">
          <div className="jm-back__button" onClick={this.handleClick}>
            <span className="jm-back__icon" />
            <span style={{ marginLeft: '0.5em' }}>返回</span>
            {!!this.props.title && (
              <span style={{ marginLeft: '1.5em' }}>{this.props.title}</span>
            )}
            {this.props.children}
          </div>
        </div>
      )
    }

    public handleClick = () => {
      const { link, replace } = this.props
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
}
