import { observable } from 'mobx'
import { Role, Rules } from './constants'

export class Store {
  @observable public role: Role = Role.Admin
  public rules = Rules
}

export default new Store()
