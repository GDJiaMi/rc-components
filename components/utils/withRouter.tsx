import React from 'react'
import { withRouter } from 'react-router'

export default (((Comp: any) => {
  return withRouter(function Wrapper(props) {
    let copy = props
    if (props.history == null) {
      copy = { ...copy }
      // @ts-ignore
      copy.history = copy.router
      // @ts-ignore
      copy.location = copy.router.location
    }
    return <Comp {...copy} />
  })
}) as any) as typeof withRouter
