/**
 * 货币，数字格式化
 */
export interface CurrencyProps {
  precision?: number
  prefix?: string
  suffix?: string
  value: number
}

const ThousandRegex = /\d(?=(\d{3})+\.)/g

export default function Currency(props: CurrencyProps) {
  return (
    (props.suffix || '') +
    props.value.toFixed(props.precision || 2).replace(ThousandRegex, '$&,') +
    (props.suffix || '')
  )
}
