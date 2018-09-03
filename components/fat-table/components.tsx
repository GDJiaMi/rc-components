import React from 'react'
import { createComponent } from '../utils/common'

export interface HelperProps<T = HTMLDivElement>
  extends React.HTMLAttributes<T> {}

export const Actions = createComponent('jm-table-actions jm-nowrap')
export const Nowrap = createComponent('jm-nowrap')

export function Action(
  props: HelperProps<HTMLAnchorElement> & {
    disabled?: boolean
  },
) {
  const { className, disabled, onClick, ...other } = props
  return (
    <a
      className={`jm-table-action ${className || ''} ${
        disabled ? 'disabled' : ''
      }`}
      onClick={disabled ? undefined : onClick}
      {...other}
    />
  )
}
