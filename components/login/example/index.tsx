import React from 'react'
import { Switch, Route } from 'react-router'
import { HashRouter, Link } from 'react-router-dom'
import ReactDOM from 'react-dom'
import { Instance as Login } from '../index'
import '../style/css'
import './style.css'

class App extends React.Component {
  public render() {
    return (
      <HashRouter>
        <Switch>
          <Route path="/" exact>
            <div>
              <Link to="/login">前往登录页面</Link>
              <br />
              <Link to="/401-test">401测试</Link>
              <br />
              <Link to="/err-test">测试错误</Link>
            </div>
          </Route>
          <Route path="/login" component={LoginTest} />
          <Route path="/login-error" component={LoginErrorTest} />
          <Route path="/401-test">
            <div>
              <Link to="/login?ref=/401-test">前往登录页面</Link>
              <br />
              <Link to="/">返回首页</Link>
            </div>
          </Route>
          <Route path="/err-test">
            <div>
              <Link to="/login-error">前往登录页面</Link>
              <br />
              <Link to="/">返回首页</Link>
            </div>
          </Route>
        </Switch>
      </HashRouter>
    )
  }
}

class LoginTest extends React.Component {
  public render() {
    return (
      <Login
        title="测试登录"
        onSubmit={async () => {
          await delay()
        }}
      />
    )
  }
}

class LoginErrorTest extends React.Component {
  public render() {
    return (
      <Login
        title="测试登录"
        onSubmit={async () => {
          await delay()
          throw new Error('登录失败，用户不存在')
        }}
      />
    )
  }
}

function delay(time: number = 3000) {
  return new Promise(res => {
    window.setTimeout(res, time)
  })
}

ReactDOM.render(<App />, document.getElementById('root'))
