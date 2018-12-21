/**
 * nProgress 进度条
 */
import React from 'react'
import { clamp } from '../utils/common'
import Spin from 'antd/es/spin'

export interface ProgressSpinProps {
  children: React.ReactNode
  /**
   * 是否为加载状态
   */
  spinning?: boolean
  className?: string
  style?: React.CSSProperties
  // n progress 配置
  /**
   * nProgress配置项. 更新速度
   */
  trickleSpeed?: number
  /**
   * 设置进度最小值
   */
  minimum?: number
  /**
   * 设置动画速度
   */
  speed?: number
}

interface State {
  progress: number
}

export default class ProgressSpin extends React.Component<ProgressSpinProps> {
  public static defaultProps = {
    trickleSpeed: 300,
    minimum: 0.08,
    speed: 400,
  }

  public state: State = {
    progress: 0,
  }

  private bar = React.createRef<HTMLDivElement>()
  private started: boolean = false
  private queue = (function() {
    const pending: Function[] = []

    function next() {
      var fn = pending.shift()
      if (fn) {
        fn(next)
      }
    }

    return function(fn: (next: () => void) => void) {
      pending.push(fn)
      if (pending.length == 1) next()
    }
  })()

  public componentDidMount() {
    if (this.props.spinning) {
      this.start()
    }
  }

  public componentDidUpdate(prevProps: ProgressSpinProps) {
    if (this.props.spinning !== prevProps.spinning) {
      if (this.props.spinning) {
        this.start()
      } else {
        this.end()
      }
    }
  }

  public render() {
    const { children, className, style, spinning } = this.props
    const progress = this.state.progress
    return (
      <div
        className={`jm-progress-spin-wrapper ${className || ''}`}
        style={style}
      >
        <div className="jm-progress-spin">
          <div
            ref={this.bar}
            className="jm-progress-spin__bar"
            style={
              progress === 0
                ? { display: 'none' }
                : {
                    transform: `translate3d(${(progress - 1) *
                      100}%, 0px, 0px)`,
                    transition: `all ${this.props.speed}ms ease 0s`,
                  }
            }
          >
            <div className="jm-progress-spin__peg" />
          </div>
          {spinning && <Spin />}
        </div>
        {spinning ? (
          <div className="ant-spin-container ant-spin-blur">{children}</div>
        ) : (
          children
        )}
      </div>
    )
  }

  private start() {
    if (!this.started) {
      this.started = true
      this.set(0)
    } else {
      return
    }

    const work = () => {
      window.setTimeout(() => {
        if (!this.started) {
          return
        }
        this.trickle()
        work()
      }, this.props.trickleSpeed!)
    }

    work()
  }

  private end() {
    this.set(1)
  }

  private trickle() {
    this.increment()
  }

  private increment(amount?: number) {
    const progress = this.state.progress
    if (progress == null) {
      return this.start()
    } else if (progress > 1) {
      return
    } else {
      if (amount == null) {
        if (progress >= 0 && progress < 0.2) {
          amount = 0.05
        } else if (progress >= 0.2 && progress < 0.5) {
          amount = 0.03
        } else if (progress >= 0.5 && progress < 0.8) {
          amount = 0.01
        } else if (progress >= 0.8 && progress < 0.99) {
          amount = 0.005
        } else {
          amount = 0
        }
      }

      const n = clamp(progress + amount, 0, 0.994)
      return this.set(n)
    }
  }

  private set(n: number) {
    if (!this.started) {
      return
    }

    n = clamp(n, this.props.minimum!, 1)
    if (n === 1) {
      this.bar.current!.style.opacity = '0'
      this.started = false
    }

    this.queue(next => {
      this.setState({ progress: n })
      if (n === 1) {
        setTimeout(() => {
          this.setState({ progress: 0 })
          this.bar.current!.style.opacity = '1'
        }, this.props.speed! * 2)
      } else {
        setTimeout(next, this.props.speed)
      }
    })
  }
}
