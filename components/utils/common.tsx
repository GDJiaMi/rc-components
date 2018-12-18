import React, { HTMLAttributes } from 'react'

/**
 * 创建组件，并固定className
 * @param cls
 * @param elm
 */
export function createComponent<T = HTMLAttributes<HTMLDivElement>>(
  cls: string,
  elm: string = 'div',
) {
  return function(props: T) {
    const { className, ...other } = props as any
    return React.createElement(elm, {
      className: `${cls} ${className || ''}`,
      ...other,
    })
  }
}

/**
 * 预定义组件的一些props值
 * @param Comp
 * @param overrideProps
 */
export function overrideComponent<P, T = any>(
  Comp: React.ComponentClass<P> | React.FC<P>,
  overrideProps: Partial<P>,
) {
  return React.forwardRef<T, P>((props, ref) => {
    return <Comp {...overrideProps} {...props} ref={ref} />
  })
}

export function delay(time: number) {
  return new Promise(res => window.setTimeout(res, time))
}
