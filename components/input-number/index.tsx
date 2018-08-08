/**
 * InputNumber
 * 大部分InputNumber场景都需要添加单位，这个组件对InputNumber进行封装，支持显示单位
 */
import React from 'react'
import InputNumber, { InputNumberProps as Props } from 'antd/lib/input-number'

export interface InputNumberProps extends Props {
  inline?: boolean
}

export default function(props: InputNumberProps) {
  const { inline, placeholder, className, ...other } = props
  return (
    <div className={`jm-inputnumber-wrapper ${(inline && 'inline') || ''}`}>
      <InputNumber className={`jm-inputnumber ${className || ''}`} {...other} />
      <span className="placeholder">{placeholder}</span>
    </div>
  )
}
