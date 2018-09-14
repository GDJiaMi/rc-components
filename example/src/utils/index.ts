import Loadable, { OptionsWithoutRender } from 'react-loadable'

export function log(content: string) {
  console.log(content)
}

const NoopComponent = () => null

export function loadComponent<
  P,
  T extends React.ComponentType<P> | { default: React.ComponentType<P> }
>(loader: () => Promise<T>) {
  return Loadable({
    loader,
    loading: NoopComponent,
  } as OptionsWithoutRender<P>)
}
