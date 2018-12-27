import { useState, useCallback } from 'react'

const MAX = Number.MAX_SAFE_INTEGER

/**
 * 强制更新
 */
export default function useUpdate() {
  const [, setCount] = useState(0)
  const update = useCallback(() => {
    setCount(c => (c + 1) % MAX)
  }, [])

  return update
}
