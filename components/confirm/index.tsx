/**
 * 确认框，用于实现常见的删除确认等场景
 */
import React, { ReactNode } from 'react'
import message from 'antd/lib/message'
import Modal from 'antd/lib/modal'
import Spin from 'antd/lib/spin'

export interface ConfirmProps<T = any> {
  // 绑定自定义数据，将在回调中返回给调用者
  context?: T
  // 前置钩子，可以在弹窗之前抛出错误，弹出错误信息
  before?: (context?: T) => Promise<void>
  // 确认时间回调
  onConfirm: (context?: T) => Promise<string | void>
  // 绑定的方法, 默认是onClick
  trigger?: string
  // 确认文本，默认是'确认'
  okText?: string
  // 取消文本，默认是'取消'
  cancelText?: string
  // 传输加载状态的props名称，默认是loading
  loadingProps?: string
  // 标题, 默认是'提示'
  title?: string
  // 消息体, 默认是'确认删除'
  message?: string | ((context?: T) => Promise<ReactNode>)
}

interface State {
  loading?: boolean
}

export default class Confirm<T> extends React.PureComponent<
  ConfirmProps<T>,
  State
> {
  public static defaultProps = {
    title: '提示',
    message: '确认删除？',
    okText: '确认',
    cancelText: '取消',
  }
  public state: State = {}
  public render() {
    const {
      children,
      trigger = 'onClick',
      loadingProps = 'loading',
    } = this.props
    const { loading } = this.state

    if (React.isValidElement(children)) {
      return React.cloneElement(children, {
        [trigger]: this.wrapHandler(children.props[trigger]),
        [loadingProps]: loading,
      })
    } else {
      return loading ? (
        <Spin />
      ) : (
        <a {...{ [loadingProps]: loading, onClick: this.handleClick }}>
          {children}
        </a>
      )
    }
  }

  private wrapHandler = (evtHandler?: Function) => (...args: any[]) => {
    if (evtHandler != null) {
      evtHandler(...args)
    }
    this.handleClick()
  }

  private handleClick = async () => {
    try {
      const { before, title, message, okText, cancelText, context } = this.props
      if (before) {
        await before(context)
      }
      let content =
        typeof message === 'function' ? await message(context) : message
      Modal.confirm({
        okText,
        cancelText,
        title,
        content,
        // 避免因为Promise阻塞后续操作
        onOk: () => {
          this.handleOk()
        },
      })
    } catch (err) {
      message.warn(err.message)
    }
  }

  private handleOk = async () => {
    try {
      this.setState({
        loading: true,
      })
      const successMessage = await this.props.onConfirm(this.props.context)
      if (successMessage) {
        message.success(successMessage)
      }
    } catch (err) {
      message.error(err.message)
    } finally {
      this.setState({
        loading: false,
      })
    }
  }
}
