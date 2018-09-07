/**
 * 登录页面示例程序
 */
import React from 'react'
import ReactDOM from 'react-dom'
import TagContainer from '../index'
import Tag from 'antd/lib/tag'
import 'antd/lib/tag/style/css'
import { UserSelectProvider, IUserSelect } from '../../user-select'
import DepartmentSelect, {
  DepartmentSelectValue,
} from '../../department-select'
import '../../department-select/style/css'
import adaptor from '../../user-select/example/adaptor'

class App extends React.Component {
  public state = {
    value: {} as DepartmentSelectValue,
  }
  private departmentSelect = React.createRef<IUserSelect>()
  public render() {
    const { value } = this.state
    return (
      <UserSelectProvider adaptor={adaptor}>
        <TagContainer
          refName="wrappedComponentRef"
          tags={
            <>
              {value.departments &&
                value.departments.map(v => <Tag key={v.id}>{v.name}</Tag>)}
            </>
          }
        >
          <DepartmentSelect
            value={value}
            wrappedComponentRef={this.departmentSelect}
            onChange={value => this.setState({ value })}
            max="5"
            locale={{ tip: '最多选择5个部门' }}
          />
        </TagContainer>
      </UserSelectProvider>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
