/**
 * 分组框架
 */
import React from 'react'

export default function Group(props: {
  before?: React.ReactNode
  header?: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className="jm-us-group">
      {props.before}
      <section className={`jm-us-group__main ${props.className || ''}`}>
        {!!props.header && (
          <header className="jm-us-group__header">{props.header}</header>
        )}
        <main className="jm-us-group__container">{props.children}</main>
      </section>
    </div>
  )
}
