/**
 * 扩展react-router Link 组件，支持返回上一级
 */
import React from 'react'
import {
  Link as ILink,
  LinkProps,
  withRouter,
  RouteComponentProps,
} from 'react-router-dom'

export default class Link extends React.Component<LinkProps> {
  public render() {
    if (this.props.to === 'goback') {
      return <Goback {...this.props} />
    } else {
      return <ILink {...this.props} />
    }
  }
}

const Goback = withRouter(
  // @ts-ignore
  class Goback extends React.Component<LinkProps & RouteComponentProps<{}>> {
    public render() {
      const { className, style, children } = this.props
      return (
        <a
          className={className}
          style={style}
          children={children}
          onClick={this.handleClick}
        />
      )
    }
    private handleClick = () => {
      this.props.history.goBack()
    }
  },
)
