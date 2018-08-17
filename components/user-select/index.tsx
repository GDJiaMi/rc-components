/**
 * 导出用户选择器及其Provider
 */
import UserSelect, {
  IUserSelect,
  UserSelectValue,
  UserSelectLocale,
  UserSelectFormatter,
  UserSelectProps,
} from './UserSelect'
import UserSelectProvider, {
  TenementDesc,
  DepartmentDesc,
  UserDesc,
  Adaptor as UserSelectAdaptor,
  ProviderProps as UserSelectProviderProps,
  Context as UserSelectContext,
} from './Provider'

export default UserSelect
export {
  IUserSelect,
  UserSelectValue,
  UserSelectLocale,
  UserSelectFormatter,
  UserSelectProps,
  UserSelectProvider,
  UserSelectProviderProps,
  TenementDesc,
  DepartmentDesc,
  UserDesc,
  UserSelectAdaptor,
  UserSelectContext,
}
