/**
 * 多行省略组件
 */
import React from 'react'
import Tooltip from 'antd/es/tooltip'

const supportLineClamp = 'webkitLineClamp' in document.body.style
const EXTRA_HEIGHT = 18

export interface EllipsisProps extends React.HTMLAttributes<HTMLDivElement> {
  // 行数
  lines: number
  // 是否使用tooltips来展示完整内容
  tooltip?: boolean
}

export default class Ellipsis extends React.Component<EllipsisProps> {
  private ele = React.createRef<HTMLDivElement>()
  public state = {
    lineHeight: 20,
  }

  public componentDidMount() {
    if (!supportLineClamp) {
      this.getLineHeight()
    }
  }

  public render() {
    const {
      lines,
      tooltip,
      children,
      className,
      style = {},
      ...others
    } = this.props

    const content =
      // 单行
      lines === 1 ? (
        <span
          className={`jm-ellipsis-single-line ${className || ''}`}
          style={style}
        >
          {this.props.children}
        </span>
      ) : supportLineClamp ? (
        // chrome 支持多行省略
        <div
          className={`jm-ellipsis-clamp ${className || ''}`}
          {...others}
          style={{ WebkitLineClamp: lines, ...style }}
        >
          {this.props.children}
        </div>
      ) : (
        <div
          ref={this.ele}
          className={`jm-ellipsis ${className || ''}`}
          style={{
            height: lines * this.state.lineHeight + EXTRA_HEIGHT,
            ...style,
          }}
        >
          {this.props.children}
        </div>
      )

    return tooltip ? (
      <Tooltip
        title={this.props.children}
        placement="bottom"
        arrowPointAtCenter
        mouseEnterDelay={0.4}
      >
        {content}
      </Tooltip>
    ) : (
      content
    )
  }

  private getLineHeight() {
    const el = this.ele.current!
    const style = window.getComputedStyle(el, null)
    const fontSize = px2Num(style.fontSize)
    const lineHeight =
      style.lineHeight === 'normal' ? fontSize * 1.3 : px2Num(style.lineHeight)
    this.setState({
      lineHeight,
    })
  }
}

function px2Num(px: string | null) {
  return px == null ? 0 : Number(px.replace('px', ''))
}
