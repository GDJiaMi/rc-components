/**
 * 导入组件封装
 */
import FatImport from './index'
import React, {
  useCallback,
  RefForwardingComponent,
  useImperativeHandle,
  useRef,
  useMemo,
} from 'react'

export interface ImportProps {
  action: string
  data?: any
  type: string
  title?: string
  accept?: string
  footer?: React.ReactNode
  onSuccess?: () => void
  // tslint:disable-next-line:no-any
  condition?: { [key: string]: any }
}

export interface ImportMethods {
  show(): void
}

export interface ProgressDesc {
  message: string
  progress: number
  status: 'cancelled' | 'fail' | 'success' | 'executing'
  taskResult: { summary: string }
}

interface T {
  taskId: string
}

export interface ImporterOptions {
  getProgress: (taskId: string) => Promise<ProgressDesc>
  /**
   * 上传响应中获取taskId
   */
  getAction: () => string
  handleStart?: (response: any, data: any) => Promise<string>
}

/**
 * 创建一个导入器
 */
export default function createImporter(options: ImporterOptions) {
  const defaultOptions = {
    handleStart: async (t: any) => {
      return (t as T).taskId
    },
  }

  // tslint:disable-next-line
  options = {
    ...defaultOptions,
    ...options,
  }

  const Import: RefForwardingComponent<ImportMethods, ImportProps> = (
    props,
    ref,
  ) => {
    const importer = useRef<FatImport<T>>(null)
    const { type, accept, ...other } = props
    const data = {
      type,
      condition: useMemo(() => JSON.stringify(props.condition || {}), [
        props.condition,
      ]),
      ...(props.data || {}),
    }

    /**
     * 通过ref暴露方法
     */
    useImperativeHandle(ref, () => ({
      show: () => {
        importer.current && importer.current.show()
      },
    }))

    /**
     * 抽取task id
     */
    const handleStart = useCallback(res => options.handleStart!(res, data), [
      data,
    ])

    /**
     * 进度处理
     */
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
          message: message && JSON.parse(message),
          taskResult,
        },
      }
    }, [])

    return (
      <>
        <FatImport
          name={'data'}
          ref={importer}
          accept={accept}
          {...other}
          data={data}
          onStart={handleStart}
          onProgress={handleProgress}
        />
      </>
    )
  }

  // tslint:disable-next-line:no-any
  function useImport(hooksOptions: {
    accept?: string
    type: string
    template?: string
    data?: any
    onSuccess?: () => void
    condition?: any
  }) {
    const { template, ...other } = hooksOptions
    const importer = useRef<ImportMethods>(null)

    const open = useCallback(() => {
      importer.current && importer.current.show()
    }, [])
    const action = options.getAction()

    return {
      open,
      props: {
        ref: importer,
        action,
        footer: template && <a href={template}>模板下载</a>,
        ...other,
      },
    }
  }

  return {
    Import: React.memo(React.forwardRef(Import)),
    useImport,
  }
}
