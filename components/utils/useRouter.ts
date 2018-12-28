import { useContext, useEffect } from 'react'

// @ts-ignore
import { __RouterContext, RouteComponentProps } from 'react-router'
import useForceUpdate from './useUpdate'

/**
 * TODO: 将在官方提供useRouter之后移除
 */
export default function useRouter<T = {}>(): RouteComponentProps<T> {
  const forceUpdate = useForceUpdate()
  const routerContext: RouteComponentProps<T> = useContext(__RouterContext)
  if (!routerContext) {
    throw new Error(
      'use-react-router may only be used within a react-router context.',
    )
  }

  useEffect(() => routerContext.history.listen(forceUpdate), [routerContext])

  return routerContext
}
