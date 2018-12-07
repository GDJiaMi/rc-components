import React from 'react'
import Modal from 'antd/lib/modal'
import Progress from 'antd/lib/progress'
import Radio, { RadioChangeEvent } from 'antd/lib/radio'
import { Showable } from '../type'
import { delay } from '../utils/common'

export { Showable }

export interface ProgressEvent {
  progress: number
  result: any
}

export interface ExportProps {
  title?: string
  onStart: (scope: 'all' | 'current') => Promise<string>
  onProgress: (taskId: string) => Promise<ProgressEvent>
  onSuccess?: () => {}
  // 显示选择数据范围
  showScope?: boolean
  initialScope?: ExportScope
  allText?: string
  footer?: React.ReactNode
  currentText?: string
}

export enum ExportScope {
  All = 'all',
  Current = 'current',
}

enum ExportState {
  INIT,
  EXPORTING,
  EXPORTED,
  EXPORT_FAIL,
}

interface State {
  scope: ExportScope
  visible: boolean
  status: ExportState
  error?: Error
  progress: number
}

export default class Export extends React.Component<ExportProps, State>
  implements Showable {
  public static defaultProps = {
    title: '导出',
    allText: '全部',
    currentText: '当前',
    showScope: true,
  }

  public state: State = {
    scope: ExportScope.All,
    visible: false,
    status: ExportState.INIT,
    progress: 0,
  }

  private taskId?: string
  private downloadUrl?: string

  public render() {
    const { title, footer, allText, currentText, showScope } = this.props
    const { visible, status, progress, error } = this.state
    const { INIT, EXPORTING, EXPORT_FAIL, EXPORTED } = ExportState
    return (
      <Modal
        maskClosable={false}
        title={title}
        footer={null}
        width="345px"
        onCancel={this.handleCancel}
        visible={visible}
      >
        <div className="jm-import">
          <div className="jm-import-content" onClick={this.handleExport}>
            <Progress
              type="circle"
              className="jm-import-upload"
              percent={progress}
              status={
                status == EXPORT_FAIL
                  ? 'exception'
                  : status == EXPORTED
                  ? 'success'
                  : 'active'
              }
              format={() =>
                status == INIT
                  ? '点击导出'
                  : status == EXPORTING
                  ? '正在导出'
                  : status == EXPORT_FAIL
                  ? '导出失败'
                  : '点击下载'
              }
            />
          </div>
          <div className="jm-import-desc error">{!!error && error.message}</div>
          {showScope && (
            <div className="jm-import-desc">
              <span style={{ marginRight: '1em' }}>数据范围: </span>
              <Radio.Group
                disabled={status == EXPORTED || status == EXPORTING}
                value={this.state.scope}
                onChange={this.handleScopeChange}
              >
                <Radio value={ExportScope.All}>{allText}</Radio>
                <Radio value={ExportScope.Current}>{currentText}</Radio>
              </Radio.Group>
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

  private handleScopeChange = (evt: RadioChangeEvent) => {
    this.setState({
      scope: evt.target.value,
    })
  }

  private handleExport = () => {
    switch (this.state.status) {
      case ExportState.INIT:
      case ExportState.EXPORT_FAIL:
        this.startExport()
        break
      case ExportState.EXPORTED:
        // 导出成功
        window.open(this.downloadUrl)
        this.handleCancel()
        break
    }
  }

  private startExport = async () => {
    try {
      this.setState({
        status: ExportState.EXPORTING,
        progress: 0,
      })
      const scope = this.state.scope
      const taskId = await this.props.onStart(scope)
      if (taskId == null) {
        throw new Error('taskId 为空')
      }
      this.taskId = taskId
      this.handleCheckProgress()
    } catch (error) {
      this.setState({
        error,
        status: ExportState.EXPORT_FAIL,
      })
    }
  }

  private handleCheckProgress = async () => {
    try {
      for (;;) {
        // 已经退出
        if (this.state.status != ExportState.EXPORTING) {
          return
        }
        const { progress, result } = await this.props.onProgress(this.taskId!)
        this.setState({ progress })
        if (progress === 100) {
          this.downloadUrl = result
          break
        }
        await delay(1000)
      }
      // 导入成功
      this.setState({ status: ExportState.EXPORTED })
    } catch (error) {
      this.setState({
        status: ExportState.EXPORT_FAIL,
        error,
      })
    }
  }

  private handleCancel = () => {
    this.reset()
  }

  private reset() {
    this.downloadUrl = undefined
    this.taskId = undefined
    this.setState({
      visible: false,
      status: ExportState.INIT,
      progress: 0,
      error: undefined,
    })
  }
}
