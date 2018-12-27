/**
 * react hooks
 */
import { Context, ContextValue } from './Provider'
import { useContext } from 'react'

export default function useAcl(): ContextValue {
  return useContext(Context)
}
