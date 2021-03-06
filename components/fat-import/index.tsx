/**
 * 通用导入组件
 */
import React from 'react'
import Modal from 'antd/es/modal'
import Progress from 'antd/es/progress'
import Upload from 'antd/es/upload'
import { UploadChangeParam } from 'antd/es/upload'
import { delay } from '../utils/common'

import create from './createImporter'

export * from './createImporter'

export interface Showable {
  show(): void
}

export interface ImportMessage {
  summary: string
  errors: Array<{
    message: string
    line: number
  }>
}

export interface ProgressEvent {
  success?: boolean
  progress: number
  error?: Error
  result: {
    // 状态信息
    message?: ImportMessage
    taskResult?: any
  }
}

export interface ImportProps<T> {
  title?: string
  accept?: string
  // 上传文件附加数据
  data?: object | ((file: File) => object)
  // 文件所在字段名
  name?: string
  // 上传地址
  action?: string
  // 上传之前， 可以返回上传的地址(action)
  beforeUpload?: (file: File) => Promise<string>
  // 提取上传错误
  extractUploadError?: (file: UploadChangeParam['file']) => Error
  // 开始导入
  onStart: (response: T) => Promise<string>
  // 查看进度
  onProgress: (task: string) => Promise<ProgressEvent>
  // 导入成功
  onSuccess?: () => void
  // 自定义底部
  footer?: React.ReactNode
}

// 状态
enum ImportState {
  // 初始化状态
  INIT,
  // 上传中
  UPLOADING,
  // 已上传
  UPLOADED,
  // 上传失败
  UPLOAD_FAILED,
  // 导入中
  IMPORTING,
  // 已导入
  IMPORTED,
  // 导入失败
  IMPORT_FAILED,
}

interface State {
  visible: boolean
  status: ImportState
  progress: number
  message?: ImportMessage
  error?: Error
  action: string
}

export default class Import<T> extends React.Component<ImportProps<T>, State>
  implements Showable {
  public static defaultProps = {
    title: '导入',
  }

  public static create = create

  public state: State = {
    visible: false,
    status: ImportState.INIT,
    progress: 0,
    action: this.props.action || '/',
  }

  private uploadResponse: T
  private taskId: string

  public render() {
    const { title, accept, data, name, footer } = this.props
    const { status, visible, action, progress, error, message } = this.state
    const {
      INIT,
      UPLOAD_FAILED,
      UPLOADING,
      UPLOADED,
      IMPORTING,
      IMPORT_FAILED,
      IMPORTED,
    } = ImportState
    return (
      <Modal
        maskClosable={false}
        title={title}
        footer={null}
        width="500px"
        visible={visible}
        onCancel={this.handleClose}
      >
        <div className="jm-import">
          <div className="jm-import-content">
            {status == INIT ||
            status == UPLOAD_FAILED ||
            status == UPLOADING ? (
              <Upload
                showUploadList={false}
                accept={accept}
                data={data}
                disabled={status == UPLOADING}
                action={action}
                name={name}
                beforeUpload={this.handleBeforeUpload}
                onChange={this.handleUploadChange}
              >
                <Progress
                  className="jm-import-upload"
                  type="circle"
                  percent={progress}
                  status={status == UPLOAD_FAILED ? 'exception' : 'active'}
                  format={percent =>
                    status == UPLOAD_FAILED
                      ? `重试`
                      : status == UPLOADING
                      ? '上传中'
                      : `点击上传`
                  }
                />
              </Upload>
            ) : (
              <div onClick={this.handleClick}>
                <Progress
                  className="jm-import-upload"
                  type="circle"
                  percent={progress}
                  status={
                    status == IMPORT_FAILED
                      ? 'exception'
                      : status == UPLOADED || status == IMPORTED
                      ? 'success'
                      : 'active'
                  }
                  format={() =>
                    status == UPLOADED
                      ? '点击开始导入'
                      : status == IMPORTING
                      ? '导入中'
                      : status == IMPORT_FAILED
                      ? '重试'
                      : '确定'
                  }
                />
              </div>
            )}
          </div>

          {(status == IMPORTED || status == UPLOADED) && (
            <div className="jm-import-desc success">
              {status == IMPORTED ? '导入成功' : '上传成功'}
            </div>
          )}

          {(status == UPLOAD_FAILED || status == IMPORT_FAILED) && (
            <div className="jm-import-desc error">
              {status == UPLOAD_FAILED ? '上传失败' : '导入失败'}:{' '}
              {error && error.message}
            </div>
          )}

          {!!message && (
            <div className="jm-import-message">
              <header className="jm-import-message__summary">
                {message.summary}
              </header>
              <main className="jm-import-message__items">
                {!!message.errors &&
                  message.errors.map(err => (
                    <div className="jm-import-message__item" key={err.line}>
                      <div className="jm-import-message__item-line">
                        {err.line}
                      </div>
                      <div className="jm-import-message__item-msg">
                        {err.message}
                      </div>
                    </div>
                  ))}
              </main>
            </div>
          )}

          {!!footer && <div className="jm-import-desc">{footer}</div>}
        </div>
      </Modal>
    )
  }

  public show() {
    this.setState({ visible: true })
  }

  private handleClick = () => {
    switch (this.state.status) {
      case ImportState.IMPORT_FAILED:
      case ImportState.UPLOADED:
        // 重新开始
        this.handleStartImport()
        break
      case ImportState.IMPORTED:
        // 关闭
        if (this.props.onSuccess) {
          this.props.onSuccess()
        }
        this.handleCancel()
        break
      default:
    }
  }

  private handleClose = () => {
    if (this.state.status === ImportState.IMPORTED && this.props.onSuccess) {
      this.props.onSuccess()
    }

    this.handleCancel()
  }

  private handleUploadChange = (info: UploadChangeParam) => {
    const status = info.file.status
    if (status === 'error') {
      this.setState({ status: ImportState.UPLOAD_FAILED })
      if (this.props.extractUploadError) {
        this.setState({
          error:
            this.props.extractUploadError(info.file) ||
            new Error(`上传失败: ${info.file.status}`),
        })
      } else {
        this.setState({ error: info.file.error })
      }
    } else if (status === 'uploading') {
      this.setState({
        status: ImportState.UPLOADING,
        error: undefined,
        progress: info.file.percent || 0,
      })
    } else if (status == 'success' || status === 'done') {
      this.setState({
        error: undefined,
        progress: 100,
      })
      // 保存响应
      this.uploadResponse = info.file.response
      setTimeout(() => {
        this.setState({
          status: ImportState.UPLOADED,
          progress: 0,
        })
      }, 1000)
    }
  }

  private handleStartImport = async () => {
    try {
      this.setState({
        progress: 0,
        status: ImportState.IMPORTING,
      })
      const taskId = await this.props.onStart(this.uploadResponse)
      this.taskId = taskId
      if (taskId == null) {
        throw new Error('taskId 为空')
      }
      // 进度查询
      this.handleCheckProgress()
    } catch (error) {
      this.setState({
        status: ImportState.IMPORT_FAILED,
        error,
      })
    }
  }

  private handleCheckProgress = async () => {
    try {
      while (true) {
        if (this.state.status != ImportState.IMPORTING) {
          return
        }

        const {
          progress,
          success,
          result,
          error,
        } = await this.props.onProgress(this.taskId)

        this.setState({
          progress: success ? 100 : Math.min(99, progress),
          message: result && result.message,
        })

        if (success) {
          break
        }

        if (error != null) {
          throw error
        }

        await delay(1000)
      }

      // 导入成功
      this.setState({ status: ImportState.IMPORTED })
    } catch (error) {
      this.setState({
        status: ImportState.IMPORT_FAILED,
        error,
      })
    }
  }

  private handleBeforeUpload = async (file: File) => {
    const beforeUpload = this.props.beforeUpload
    if (beforeUpload == null) {
      return
    }

    try {
      const action = await beforeUpload(file)
      if (this.props.action == null) {
        this.setState({
          action,
        })
      }
      await delay(500)
    } catch (error) {
      this.setState({ error, status: ImportState.UPLOAD_FAILED })
      throw error
    }
  }

  private handleCancel = () => {
    this.reset()
  }

  private reset() {
    this.setState({
      visible: false,
      status: ImportState.INIT,
      progress: 0,
      error: undefined,
      message: undefined,
    })
  }
}
