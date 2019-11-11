import { FormComponentProps, ValidationRule } from 'antd/es/form'
import get from 'lodash/get'
import React, { useCallback } from 'react'

export interface FormConfig<T> {
  // tslint:disable-next-line:no-any
  initialValue?: (itemValue: any, value: T | undefined) => any
  valuePropName?: string
  validateTrigger?: string | string[]
  validateFirst?: boolean
  trigger?: string
  required?: string
  rules?: ValidationRule[]
  // 将名称中的'.'转换为_, 因为getFieldDecorator会进行转换
  transformDot?: boolean
  // tslint:disable-next-line:no-any
  getValueFromEvent?: (...args: any[]) => any
  exclusive?: boolean
  onChange?: (e: any) => void
}

export interface FormConfigs<T> {
  [key: string]: FormConfig<T>
}

/**
 * 配置表单验证规则
 * @example
 *       const { fields: f } = useFormItem(form, value, {
 *         'alarmRules.rule_lockIp.enabled': { valuePropName: 'checked' },
 *         'alarmRules.rule_lockIp.count': {},
 *         'alarmRules.rule_lockAccount.enabled': { valuePropName: 'checked' },
 *         'alarmRules.rule_lockAccount.count': {},
 *       })
 */
export default function useFormItem<T, P extends FormConfigs<T>>(
  form: FormComponentProps['form'],
  value: T | undefined,
  items: P,
): {
  fields: { [key in keyof P]: <N extends React.ReactNode>(node: N) => N }
  validate: (cb: any) => void
} {
  const { getFieldDecorator } = form
  const fields: any = {}
  const keys = Object.keys(items)

  keys.forEach(name => {
    const { initialValue, transformDot, required, rules, ...other } = items[
      name
    ]
    const fieldValue = value && get(value, name)
    const overrideRules = rules || []
    let fieldName = name
    if (required != null) {
      overrideRules.push({ required: true, message: required })
    }

    if (transformDot) {
      fieldName = name.replace(/\./g, '@')
    }

    fields[name] = getFieldDecorator(fieldName, {
      initialValue:
        typeof initialValue === 'function'
          ? initialValue(fieldValue, value)
          : fieldValue,
      rules: overrideRules,
      ...other,
    })
  })

  const validate = useCallback(
    (cb: (value: any) => void) => {
      form.validateFields((error: any, value: any) => {
        if (error != null) {
          return
        }
        keys.forEach(name => {
          const { transformDot } = items[name]
          if (transformDot) {
            const fieldName = name.replace(/\./g, '@')
            value[name] = value[fieldName]
            delete value[fieldName]
          }
        })
        cb(value)
      })
    },
    [items],
  )

  return { fields, validate }
}
