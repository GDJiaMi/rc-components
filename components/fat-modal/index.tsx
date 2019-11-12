import React from 'react'
import Form, { FormComponentProps } from 'antd/es/form'
import Spin from 'antd/es/spin'
import Alert from 'antd/es/alert'
import Modal from 'antd/es/modal'
import message from 'antd/es/message'

export interface FatModalLocale {
  title: string
  okText: string
  cancelText: string
}

export type HandleModalSubmit<T> = (
  values: T,
  defaultValue: Partial<T>,
) => Promise<string | void>

export type ModalRenderer<T> = (
  form: FormComponentProps['form'],
  defaultValue: Partial<T>,
) => React.ReactNode

export interface FatModalProps<T> extends Partial<FatModalLocale> {
  className?: string
  style?: React.CSSProperties
  // 传入form和defaultValue用于渲染表单
  children: ModalRenderer<T>
  // 表单提交。回调需要返回一个promise，如果出现异常，modal会显示异常信息；
  // 也可以返回字符串，表示成功提示语
  onSubmit: HandleModalSubmit<T>
  // 是否在关闭后重置表单
  resetAfterHide?: boolean
  width?: string
}

export interface TemporaryProps<T> extends Partial<FatModalLocale> {
  defaultValue: Partial<T>
}

export interface IFatModal<T> {
  show(props?: TemporaryProps<T>): void
}

interface Props<T> extends FormComponentProps, FatModalProps<T> {}

interface State<T> {
  visible?: boolean
  loading?: boolean
  error?: Error
  // 临时props，从方法中传入
  templateProps?: TemporaryProps<T>
}

/**
 * 胖模态框
 * 适用于大部分场景下的
 */
export class FatModalInner<T> extends React.Component<Props<T>, State<T>>
  implements IFatModal<T> {
  public state: State<T> = {
    loading: false,
  }
  public static defaultProps = {
    resetAfterHide: true,
    title: 'title',
  }

  public render() {
    const {
      children,
      form,
      title,
      okText,
      cancelText,
      width,
      className,
      style,
    } = this.props
    const { templateProps: temp, visible, error, loading } = this.state
    return (
      <Modal
        className={`jm-fatmodal ${className || ''}`}
        style={style}
        title={(temp && temp.title) || title || '模态框'}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        maskClosable={false}
        width={width}
        confirmLoading={loading}
        okText={(temp && temp.okText) || okText}
        cancelText={(temp && temp.cancelText) || cancelText}
      >
        {!!error && (
          <>
            <Alert banner message={error.message} type="error" />
            <div className="ant-alert-placeholder" />
          </>
        )}
        <Spin spinning={loading}>
          {children(form, (temp && temp.defaultValue) || {})}
        </Spin>
      </Modal>
    )
  }

  /**
   * 显示模态框，并传进临时props
   */
  public show = (props?: TemporaryProps<T>) => {
    this.setState({
      templateProps: props,
      visible: true,
    })
  }

  private handleOk = () => {
    this.props.form.validateFields(async (errors, values) => {
      if (errors != null) {
        return
      }

      try {
        this.setState({
          loading: true,
          error: undefined,
        })
        const temp = this.state.templateProps
        const successMessage = await this.props.onSubmit(
          values,
          (temp && temp.defaultValue) || {},
        )
        this.setState(
          {
            visible: false,
          },
          () => {
            if (successMessage) {
              message.success(successMessage)
            }
            this.reset()
          },
        )
      } catch (error) {
        this.setState({
          error,
        })
      } finally {
        this.setState({
          loading: false,
        })
      }
    })
  }

  private handleCancel = () => {
    this.setState(
      {
        visible: false,
      },
      () => {
        this.reset()
      },
    )
  }

  private reset() {
    if (this.props.resetAfterHide) {
      this.props.form.resetFields()
      this.setState({
        error: undefined,
        loading: false,
        templateProps: undefined,
      })
    }
  }
}

// FIXME: 避免使用any
const FatModalWithForm = Form.create()(FatModalInner) as any

export default function FatModal<T>(
  props: FatModalProps<T> & {
    wrappedComponentRef?: React.Ref<IFatModal<T>>
  },
) {
  return <FatModalWithForm {...props} />
}
