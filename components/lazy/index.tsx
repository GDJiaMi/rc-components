/**
 * 加载异步组件
 */
import React, { ComponentType, Suspense, lazy as l } from 'react'
import ComponentLoading from '../component-loading'

export default function lazy<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
) {
  const Comp = l(factory)

  return (props => {
    return (
      <Suspense fallback={<ComponentLoading />}>
        <Comp {...props} />
      </Suspense>
    )
  }) as typeof Comp
}
