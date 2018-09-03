import React from 'react'
import ReactDOM from 'react-dom'
import ErrorPage from '../index'
import Button from 'antd/lib/button'
import 'antd/lib/button/style/css'
import '../style/css.ts'

class App extends React.Component {
  public render() {
    return (
      <>
        <ErrorPage.NotFound>
          <Button type="primary">返回</Button>
          <Button>首页</Button>
        </ErrorPage.NotFound>
        <ErrorPage.Forbidden />
        <ErrorPage.InternalError />
        <ErrorPage.Unauthorized />
      </>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
