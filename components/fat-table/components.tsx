import React from 'react'
import { Link } from 'react-router-dom'
import { LocationDescriptor } from 'history'
import { createComponent } from '../utils/common'

export interface HelperProps<T = HTMLDivElement>
  extends React.HTMLAttributes<T> {}

export const Actions = createComponent('jm-table-actions jm-nowrap')
export const Nowrap = createComponent('jm-nowrap')
export const EmptyColumn = createComponent('jm-table__empty-column')

/**
 * 表格行操作项
 */
export function Action(
  props: HelperProps<HTMLAnchorElement> & {
    disabled?: boolean
    to?: LocationDescriptor
  },
) {
  const { className, to, disabled, onClick, ...other } = props
  const commonProps = {
    className: `jm-table-action ${className || ''} ${
      disabled ? 'disabled' : ''
    }`,
    onClick: disabled ? undefined : onClick,
    ...other,
  }

  if (to != null) {
    // @ts-ignore
    return <Link to={to} {...commonProps} />
  }
  return <a {...commonProps} />
}
