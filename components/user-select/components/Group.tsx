/**
 * 分组框架
 */
import React from 'react'

export default function Group(props: {
  header?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <section className="jm-us-group">
      <header className="jm-us-group__header">{props.header}</header>
      <main className="jm-us-group__container">{props.children}</main>
    </section>
  )
}
