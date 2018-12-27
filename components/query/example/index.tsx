import React, { useState, useEffect, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { HashRouter } from 'react-router-dom'
import Query from '../index'

function App() {
  return (
    <HashRouter>
      <Query.Provider>
        <div>
          <Example />
        </div>
      </Query.Provider>
    </HashRouter>
  )
}

function Example() {
  const query = Query.useQuery()
  const getter = query.getter('sp')
  const setter = query.setter('sp')

  useEffect(() => {
    setter('count', 1)
  }, [])

  const increment = () => {
    const count = getter.getInt('count', 0)
    setter('count', count + 1)
  }

  return (
    <div>
      {JSON.stringify(query.value)}
      <div>
        count:
        {getter.getStr('count')}
      </div>
      <button onClick={increment}>increment</button>
    </div>
  )
}

// @ts-ignore
ReactDOM.render(<App />, document.getElementById('root'))
