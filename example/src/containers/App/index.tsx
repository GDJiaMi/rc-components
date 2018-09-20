/**
 * 根组件
 */
import React from 'react'
import { observer } from 'mobx-react'
import { Router } from 'react-router-dom'
import { LocaleProvider } from 'antd'
import { Title, Acl } from '@gdjiami/rc-components'
import zhCN from 'antd/lib/locale-provider/zh_CN'
import moment from 'moment'
import { Rules } from '@src/constants'
import store from './store'
import 'moment/locale/zh-cn'
import history from '@src/history'
import Routes from './Routes'
import './style.css'

@observer
export default class App extends React.Component {
  public render() {
    return (
      <LocaleProvider locale={zhCN}>
        <Router history={history}>
          <Title.Provider>
            <Acl.Provider role={store.role} rules={Rules}>
              <Routes />
            </Acl.Provider>
          </Title.Provider>
        </Router>
      </LocaleProvider>
    )
  }
}

moment.locale('zh-cn')
