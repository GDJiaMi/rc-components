import { useRef } from 'react'

import { IFatModal, TemporaryProps, FatModalProps } from './index'

export default function useFatModal<T>(props: FatModalProps<T>) {
  const ref = useRef<IFatModal<T>>(null)

  const show = (props?: TemporaryProps<T>) => {
    ref.current && ref.current.show(props)
  }

  return { show, props: { ...props, wrappedComponentRef: ref } }
}
