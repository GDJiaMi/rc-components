import React from 'react'
import ProgressSpin from '../index'
import Button from 'antd/es/button'
import '../style/css'

export default class Example extends React.Component {
  state = {
    loading: false,
  }
  public render() {
    return (
      <div>
        <ProgressSpin spinning={this.state.loading}>
          <div
            style={{
              width: '200px',
              height: '200px',
              backgroundColor: '#ccc',
              margin: '0 auto',
              textAlign: 'center',
            }}
          >
            内容
          </div>
        </ProgressSpin>
        <Button onClick={this.handleStart}>Toggle</Button>
      </div>
    )
  }

  private handleStart = () => {
    this.setState({ loading: !this.state.loading })
  }
}
