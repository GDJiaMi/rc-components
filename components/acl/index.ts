/**
 * 访问控制相关组件
 */
import Provider, { AclProviderProps, ContextValue, Context } from './Provider'
import Choose, { ChooseProps } from './Choose'
import Switch from './Switch'
import Option, { ChooseOptionProps } from './Option'
import Allows, { AllowsProps } from './Allows'
import { allows, allowsAll, allowsSome, allowsInner } from './allowsHocs'
import withAcl, { AclProps, AclInjectedProps } from './withAcl'
import { Rules, Action, Role } from './type'

export default {
  Provider,
  Choose,
  Switch,
  Option,
  Allows,
  allows,
  allowsAll,
  allowsSome,
  allowsInner,
  withAcl,
  Context,
}

export {
  AclProviderProps,
  ContextValue,
  ChooseProps,
  ChooseOptionProps,
  AllowsProps,
  AclProps,
  AclInjectedProps,
  Rules,
  Role,
  Action,
}
