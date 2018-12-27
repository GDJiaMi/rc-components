import Provider, { QueryContext } from './Provider'
import withQuery from './withQuery'
import useQuery from './hook'
export * from './Provider'

export default {
  Provider,
  withQuery,
  useQuery,
  Context: QueryContext,
}
