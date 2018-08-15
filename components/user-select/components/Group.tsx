/**
 * 分组框架
 */
import React from 'react'

export default function Group(props: {
  header?: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  return (
    <section className={`jm-us-group ${props.className || ''}`}>
      <header className="jm-us-group__header">{props.header}</header>
      <main className="jm-us-group__container">{props.children}</main>
    </section>
  )
}
