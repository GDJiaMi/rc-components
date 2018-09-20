/**
 * 货币，数字格式化
 */
import React, { StatelessComponent, HTMLAttributes } from 'react'

export interface CurrencyProps extends HTMLAttributes<HTMLSpanElement> {
  precision?: number
  prefix?: string
  suffix?: string
  value: number
}

const ThousandRegex = /\d(?=(\d{3})+\.)/g

const Currency: StatelessComponent<CurrencyProps> = (props: CurrencyProps) => {
  const { suffix, value, precision, prefix, ...other } = props
  return (
    <span {...other}>
      {(prefix || '') +
        value.toFixed(precision || 2).replace(ThousandRegex, '$&,') +
        (suffix || '')}
    </span>
  )
}

export default Currency
