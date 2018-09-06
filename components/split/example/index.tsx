/**
 * 登录页面示例程序
 */
import React from 'react'
import ReactDOM from 'react-dom'
import Split from '../index'
import '../style/css'
import './style.css'

class App extends React.Component {
  public render() {
    return (
      <Split split="vertical" className="hello">
        <div>left</div>
        <Split split="horizontal">
          <div>top</div>
          <div>right</div>
        </Split>
      </Split>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
