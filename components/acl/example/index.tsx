import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter, Route } from 'react-router-dom'
import { observer } from 'mobx-react'
import Acl from '../'
import '../style/css'
import Root from './Root'
import store from './store'
import './style.css'

@observer
class App extends React.Component {
  public render() {
    return (
      <HashRouter>
        <Acl.Provider role={store.role} rules={store.rules}>
          <Route component={Root} />
        </Acl.Provider>
      </HashRouter>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
