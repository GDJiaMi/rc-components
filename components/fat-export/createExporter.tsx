import React, {
  RefForwardingComponent,
  useImperativeHandle,
  useRef,
  useCallback,
} from 'react'
import FatExport, { ExportScope } from './index'
import { Omit } from '../utils/type-utils'

export interface ExportMethods {
  show(): void
}

export { ExportScope }

export interface ExportProps {
  onStart: (scope: ExportScope) => Promise<string>
  title?: string
  onSuccess?: () => {}
  showScope?: boolean
  initialScope?: ExportScope
  allText?: string
  footer?: React.ReactNode
  currentText?: string
  fileName?: string
}

export interface ProgressDesc {
  message: string
  progress: number
  status: 'cancelled' | 'fail' | 'success' | 'executing'
  // 执行成功后应该返回下载url
  taskResult: { fileId: string }
}

export interface ExporterOptions {
  /**
   * 请求导出，返回一个taskId
   */
  handleStart: (params: any) => Promise<string>
  getProgress: (taskId: string) => Promise<ProgressDesc>
  getDownloadUrl: (fileId: string, fileName?: string) => string
}

/**
 * 创建导出器
 */
export default function createExporter(options: ExporterOptions) {
  /**
   * 封装FatTable
   */
  const Export: RefForwardingComponent<ExportMethods, ExportProps> = (
    props,
    ref,
  ) => {
    const { showScope = false, fileName, ...other } = props
    const exporter = useRef<FatExport>(null)

    useImperativeHandle(ref, () => ({
      show: () => {
        exporter.current!.show()
      },
    }))

    const handleProgress = useCallback(async (taskId: string) => {
      const {
        message,
        progress,
        status,
        taskResult,
      } = await options.getProgress(taskId)

      const success = status === 'success'
      return {
        success,
        error:
          status === 'cancelled'
            ? new Error('任务已取消')
            : status === 'fail'
            ? new Error('任务执行失败')
            : undefined,
        progress,
        result: {
          message,
          taskResult: success
            ? options.getDownloadUrl(taskResult.fileId, fileName)
            : undefined,
        },
      }
    }, [])

    // @ts-ignore
    return (
      <FatExport
        ref={exporter}
        {...other}
        showScope={showScope}
        onProgress={handleProgress}
      />
    )
  }

  /**
   * React hook 用于生成FatExport 参数和使用方法
   */
  function useExport<T>(
    hooksOptions: {
      type: string
      condition?: (scope: ExportScope) => T
      data?: any
    } & Omit<ExportProps, 'onStart'>,
  ) {
    const exporter = useRef<ExportMethods>(null)
    const { condition, data, type, ...other } = hooksOptions

    const open = useCallback(() => {
      exporter.current && exporter.current.show()
    }, [])

    // 获取taskId
    const handleStart = useCallback(
      async (scope: ExportScope) => {
        return options.handleStart({
          scope,
          type,
          condition: typeof condition === 'function' ? condition(scope) : '',
          ...(data || {}),
        })
      },
      [condition, type, data],
    )

    return {
      open,
      props: {
        ref: exporter,
        onStart: handleStart,
        ...other,
      },
    }
  }

  return {
    Export: React.memo(React.forwardRef(Export)),
    useExport,
  }
}
