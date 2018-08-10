/**
 * 访问控制相关组件
 */
import Provider, { AclProviderProps, ContextValue, Context } from './Provider'
import Choose, {
  ChooseProps,
  Switch,
  Option,
  ChooseOptionProps,
} from './Choose'
import Allows, {
  AllowsProps,
  allows,
  allowsAll,
  allowsSome,
  allowsInner,
} from './Allows'
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
