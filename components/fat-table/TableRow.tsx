import React from 'react'

export default (props: { error?: Error; className?: string }) => {
  const { error, className, ...other } = props
  return (
    <tr
      className={`jm-table__row ${(!!error && 'error') || ''} ${className}`}
      {...other}
    />
  )
}
