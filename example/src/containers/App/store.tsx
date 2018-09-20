/**
 * AppStore
 */
import { observable } from 'mobx'
import { Role } from '@src/constants'

export class AppStore {
  @observable
  public role: Role = Role.Admin
}

export default new AppStore()
