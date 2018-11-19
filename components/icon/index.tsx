/**
 * 业务图标
 * 图标可以采集至 http://iconfont.cn
 * 配合svg-sprite-loader
 * @example <Icon src={require('assets/icons/github.svg')} />
 */
import React from 'react'

export interface SvgSrc {
  viewBox: string
  id: string
}

export interface IconProps extends React.SVGProps<any> {
  src: SvgSrc
  spinning?: boolean
}

/**
 * @deprecated 现在直接使用svgr转换为React组件
 */
export default class Icon extends React.PureComponent<IconProps, {}> {
  public render() {
    const { src, className, spinning, ...other } = this.props
    return (
      <svg
        viewBox={src.viewBox}
        className={`jm-icon ${className || ''} ${(spinning && 'loading') ||
          ''}`}
        {...other}
      >
        <use xlinkHref={`#${src.id}`} />
      </svg>
    )
  }
}
