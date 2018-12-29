/**
 * 货币，数字格式化
 */
import React, { HTMLAttributes } from 'react'

export interface CurrencyProps extends HTMLAttributes<HTMLSpanElement> {
  precision?: number
  prefix?: string
  suffix?: string
  value: number
}

const ThousandRegex = /\d(?=(\d{3})+(\.|$))/g

export default class Currency extends React.PureComponent<CurrencyProps> {
  public render() {
    const { suffix, value, precision, prefix, ...other } = this.props
    return (
      <span {...other}>
        {(prefix || '') +
          value
            .toFixed(precision != null ? precision : 2)
            .replace(ThousandRegex, '$&,') +
          (suffix || '')}
      </span>
    )
  }
}
