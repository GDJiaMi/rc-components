/**
 * 通用的登录页面
 */
import React from 'react'
import qs from 'qs'
import { withRouter, RouteComponentProps } from 'react-router'
import Layout, { Input, Button } from '../login-layout'
import Form, { FormComponentProps } from 'antd/es/form'
import Checkbox, { CheckboxChangeEvent } from 'antd/es/checkbox'

export interface Params {
  account: string
  password: string
}

export interface LoginProps {
  /**
   * 标题
   * @default '登录'
   */
  title?: string
  /**
   * logo, 图片rul
   */
  logo?: string
  /**
   * 自定义底部
   */
  footer?: React.ReactNode
  /**
   * 自定义背景图片
   */
  background?: string
  /**
   * 自定义根路径，登录成功后将自动跳转到该路径。如果存在ref查询字符串属性，将优先跳转到ref指定的路由
   * @default '/'
   */
  indexRouter?: string
  /**
   * 处理提交。在这个事件处理器中进行用户名、密码检查。可选返回一个跳转地址.
   * 如果抛出错误，Login将展示错误信息
   */
  onSubmit: (value: Params) => Promise<string | void>
  /**
   * 登录成功后, 这个回调将被触发
   */
  onSuccess?: () => void
  /**
   * 是否显示记住账号选项
   */
  rememberAccount?: boolean
}

export interface Props
  extends LoginProps,
    FormComponentProps,
    RouteComponentProps<void> {}

const RememberAccountKey = '__login.account__'

export class LoginInner extends React.Component<Props> {
  public static Layout = Layout
  public state: {
    logining: boolean
    error?: Error
    account?: string
    rememberAccount?: boolean
  } = {
    logining: false,
    rememberAccount: false,
  }

  public componentDidMount() {
    const rememberAccount = window.localStorage.getItem(RememberAccountKey)
    if (rememberAccount) {
      this.setState({ account: rememberAccount, rememberAccount: true })
    }
  }

  public render() {
    const {
      title = '登录',
      logo,
      footer,
      background,
      rememberAccount,
      form: { getFieldDecorator },
    } = this.props
    return (
      <Layout {...{ title, logo, footer, background }}>
        <div className="jm-login__wrapper">
          <Form layout="horizontal" onSubmit={this.handleSubmit}>
            <Form.Item>
              {getFieldDecorator('account', {
                rules: [
                  {
                    required: true,
                    message: '请输入账号',
                  },
                ],
                initialValue: this.state.account,
              })(<Input placeholder="账号" autoFocus />)}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator('password', {
                rules: [
                  {
                    required: true,
                    message: '请输入密码',
                  },
                ],
              })(<Input placeholder="密码" type="password" />)}
              {!!rememberAccount && (
                <Checkbox
                  checked={this.state.rememberAccount}
                  onChange={this.handleChange}
                  className="jm-login__checkbox"
                >
                  记住帐号
                </Checkbox>
              )}
            </Form.Item>
            <Form.Item>
              <Button loading={this.state.logining}>登录</Button>
            </Form.Item>
            {!!this.state.error && (
              <div className="jm-login__alert">{this.state.error.message}</div>
            )}
          </Form>
        </div>
      </Layout>
    )
  }

  private handleChange = (e: CheckboxChangeEvent) => {
    const checked = e.target.checked
    this.setState({ rememberAccount: checked })
    if (!checked) {
      window.localStorage.removeItem(RememberAccountKey)
    }
  }

  private handleSubmit = async (evt: React.FormEvent<void>) => {
    evt.preventDefault()
    this.props.form.validateFields(async (errors, value: Params) => {
      if (errors != null) {
        return
      }
      try {
        this.setState({ logining: true, error: undefined })
        const url = await this.props.onSubmit(value)
        // 重定向
        setTimeout(() => {
          this.props.history.replace(url || this.getRedirectUrl())
        }, 100)

        if (this.props.onSuccess) {
          this.props.onSuccess()
        }

        if (this.state.rememberAccount) {
          window.localStorage.setItem(RememberAccountKey, value.account)
        }
      } catch (err) {
        this.setState({ error: err })
      } finally {
        this.setState({ logining: false })
      }
    })
  }

  private getRedirectUrl() {
    const search = this.props.location.search
    const params = qs.parse(search.startsWith('?') ? search.slice(1) : search)
    if ('ref' in params) {
      return params.ref as string
    }
    return this.props.indexRouter || '/'
  }
}

// @ts-ignore
const LoginInnerWrapped = withRouter(Form.create()(LoginInner))

export default function Login(props: LoginProps) {
  return <LoginInnerWrapped {...props} />
}
