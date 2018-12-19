import React from 'react'
import { RouteProps, RouteComponentProps, Route as IRoute } from 'react-router'
import Title from './Title'

export interface ExtendedRouteProps extends RouteProps {
  title?:
    | React.ReactChild
    | ((props: RouteComponentProps<any>) => React.ReactNode)
  remountOnChange?: boolean
}

/**
 * 包装`react-router`组件，支持声明title
 */
export default class Route extends React.Component<ExtendedRouteProps> {
  public render() {
    const {
      title,
      remountOnChange,
      component,
      render,
      children,
      ...other
    } = this.props
    return (
      <IRoute
        {...other}
        render={props => (
          <>
            {!!title && (
              <Title
                link={props.match.url}
                key={props.match.url}
                dontTransformLink
              >
                {typeof title === 'function' ? title(props) : title}
              </Title>
            )}
            <React.Fragment
              key={remountOnChange ? props.location.pathname : undefined}
            >
              {component != null
                ? React.createElement(component as any, props)
                : render != null
                ? render(props)
                : typeof children === 'function'
                ? (children as (props: ExtendedRouteProps) => React.ReactNode)(
                    props,
                  )
                : children}
            </React.Fragment>
          </>
        )}
      />
    )
  }
}
