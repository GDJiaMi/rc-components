import React from 'react'
import ReactDOM from 'react-dom'
import FooterToolBar from '../index'
import Button from 'antd/lib/button'
import 'antd/lib/button/style/css'
import '../style/css'

class App extends React.Component {
  public render() {
    return (
      <div>
        <FooterToolBar left="left content">
          <Button>取消</Button>
          <Button type="primary">提交</Button>
        </FooterToolBar>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
