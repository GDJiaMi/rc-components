/**
 * 标签容器
 */
import React from 'react'
import { Showable } from '../type'

export interface TagContainerProps {
  refName?: string
  selectText?: string
  tags?: React.ReactNode
}

export default class TagContainer extends React.Component<TagContainerProps> {
  public static defaultProps = {
    selectText: '选择',
  }
  private elm = React.createRef<Showable>()
  public render() {
    const { children, refName = 'ref', selectText, tags } = this.props
    return (
      <div className="jm-tag-container">
        {React.isValidElement(children)
          ? React.cloneElement(children, {
              [refName as string]: (ref: Showable) => {
                const orgRef = children.props[refName]
                if (orgRef) {
                  if (typeof orgRef === 'function') {
                    orgRef(ref)
                  } else {
                    orgRef.current = ref
                  }
                }
                // @ts-ignore
                this.elm.current = ref
              },
            })
          : children}
        <div className="jm-tag-container__header">
          <a onClick={this.handleSelect}>{selectText}</a>
        </div>
        <div className="jm-tag-container__body">{tags}</div>
      </div>
    )
  }

  private handleSelect = () => {
    this.elm.current!.show()
  }
}
