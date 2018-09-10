import React from 'react'
import ReactDOM from 'react-dom'
import Ellipsis from '../index'
import '../style/css'

class App extends React.Component {
  public render() {
    return (
      <div style={{ width: '200px' }}>
        <Ellipsis lines={3} tooltip>
          There were injuries alleged in three cases in 2015, and a fourth
          incident in September, according to the safety recall report. After
          meeting with US regulators in October, the firm decided to issue a
          voluntary recall.
        </Ellipsis>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
