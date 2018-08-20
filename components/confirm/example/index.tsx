import React from 'react'
import ReactDOM from 'react-dom'
import Confirm from '../index'
import Button from 'antd/lib/button'
import '../style/css'
import './style.css'

class App extends React.Component {
  public render() {
    return (
      <div>
        <Confirm onConfirm={this.handleRemove}>
          <button className="btn">删除</button>
        </Confirm>
        <Confirm onConfirm={this.handleRemoveSuccess}>
          <button className="btn">删除(成功后消息提示)</button>
        </Confirm>
        <Confirm
          onConfirm={this.handleRemoveSuccess}
          before={async () => {
            throw new Error('请选择用户')
          }}
        >
          <button className="btn">删除(设置前置条件)</button>
        </Confirm>
        <Confirm onConfirm={this.handleRemoveLoading}>
          <Button className="btn">删除(确认状态, 通过props.loading注入)</Button>
        </Confirm>
        <Confirm onConfirm={this.handleRemoveLoading}>删除(确认状态2)</Confirm>
        <Confirm onConfirm={this.handleRemoveError}>
          <button className="btn">删除异常</button>
        </Confirm>
        <Confirm
          onConfirm={this.handleRemove}
          title="自定义标题"
          message={async () => {
            return `确认删除A，B， C用户`
          }}
          okText="干"
          cancelText="不干"
        >
          <button className="btn">删除(自定义文本)</button>
        </Confirm>
        <Confirm onConfirm={this.handleRemoveWithContext} context="id-1212">
          <button className="btn">
            删除(绑定上下文，可以避免lambda式事件回调)
          </button>
        </Confirm>
      </div>
    )
  }

  private handleRemove = async () => {
    console.log('开始删除')
  }

  private handleRemoveSuccess = async () => {
    return '成功删除'
  }

  private handleRemoveLoading = async () => {
    await delay(3000)
  }

  private handleRemoveError = async () => {
    throw new Error('模拟删除遗产')
  }

  private handleRemoveWithContext = async (context: string) => {
    return `已删除：${context}`
  }
}

ReactDOM.render(<App />, document.getElementById('root'))

function delay(time: number) {
  return new Promise(res => window.setTimeout(res, time))
}
