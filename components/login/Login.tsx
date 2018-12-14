/**
 * 通用的登录页面
 */
import React from 'react'
import qs from 'qs'
import { withRouter, RouteComponentProps } from 'react-router'
import Layout from './Layout'
import Form, { FormComponentProps } from 'antd/es/form'
import Button from 'antd/es/button'
import Input from 'antd/es/input'

export interface Params {
  account: string
  password: string
}

export interface LoginProps
  extends FormComponentProps,
    RouteComponentProps<void> {
  title?: string
  logo?: string
  footer?: React.ReactNode
  background?: string
  indexRouter?: string
  onSubmit: (value: Params) => Promise<string | void>
  onSuccess?: () => void
}

export class Login extends React.Component<LoginProps> {
  public static Layout = Layout
  public state: {
    logining: boolean
    error?: Error
  } = {
    logining: false,
  }
  public render() {
    const {
      title = '登录',
      logo,
      footer,
      background,
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
              })(<Input placeholder="账号" size="large" autoFocus />)}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator('password', {
                rules: [
                  {
                    required: true,
                    message: '请输入密码',
                  },
                ],
              })(<Input placeholder="密码" size="large" type="password" />)}
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                size="large"
                style={{ width: '100%', marginTop: '1em' }}
                htmlType="submit"
                loading={this.state.logining}
              >
                登录
              </Button>
            </Form.Item>
            {!!this.state.error && (
              <div className="jm-login__alert" style={{ marginTop: '-17px' }}>
                {this.state.error.message}
              </div>
            )}
          </Form>
        </div>
      </Layout>
    )
  }

  private handleSubmit = async (evt: React.FormEvent<void>) => {
    evt.preventDefault()
    this.props.form.validateFields(async (errors, value) => {
      if (errors != null) {
        return
      }
      try {
        this.setState({ logining: true, error: undefined })
        const url = await this.props.onSubmit(value)
        // 重定向
        this.props.history.replace(url || this.getRedirectUrl())
        if (this.props.onSuccess) {
          this.props.onSuccess()
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

export default withRouter(Form.create()(Login))
