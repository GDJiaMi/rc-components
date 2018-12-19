import React from 'react'
import Breadcrumb, { BreadcrumbProps } from 'antd/es/breadcrumb'
import { Link } from 'react-router-dom'
import { TitleDesc } from './type'
import { Context } from './Provider'

export interface DisplayProps extends BreadcrumbProps {
  /**
   * 设置display为'inline'
   * @default false
   */
  inline?: boolean
  /**
   * 渲染为Breadcrumb
   * @default false
   */
  breadcrumb?: boolean
  /**
   * 自定义渲染
   */
  renderItems?: (items: TitleDesc[]) => React.ReactNode
}

/**
 * 展示title
 */
export default function Display(props: DisplayProps) {
  const { breadcrumb, renderItems, className, inline, ...other } = props
  return (
    <Context.Consumer>
      {({ titles }) => {
        const lastTitle = titles[titles.length - 1]
        return renderItems != null ? (
          renderItems(titles)
        ) : breadcrumb ? (
          <Breadcrumb
            {...other}
            className={`${className || ''} ${inline ? 'inline' : ''}`}
          >
            {titles.map((t, index) => (
              <Breadcrumb.Item key={t.id}>
                {index === titles.length - 1 || t.link == null ? (
                  t.content
                ) : (
                  <Link to={t.link}>{t.content}</Link>
                )}
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
        ) : (
          (lastTitle && lastTitle.content) || ''
        )
      }}
    </Context.Consumer>
  )
}
