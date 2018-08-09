import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter } from 'react-router-dom'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import Acl from '../'
import '../style/css'
import './style.css'
import { Role, Rules } from './constants'
import Home from './Home'

@observer
class App extends React.Component {
  @observable private role: Role = Role.Admin
  public render() {
    return (
      <HashRouter>
        <Acl.Provider role={this.role} rules={Rules}>
          <Home />
        </Acl.Provider>
      </HashRouter>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
