import { useContext } from 'react'
import { QueryContext, QueryContextValue } from './Provider'

export default function useQuery(): QueryContextValue {
  return useContext(QueryContext)
}
