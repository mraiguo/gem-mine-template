import React from 'react'
import { smart, actions, withRouter, Routes } from 'cat-eye'
import 'styles/app'

const App = props => {
  return (
    <div className="main">
      <Routes />
    </div>
  )
}

export default withRouter(
  smart(state => {
    return {}
  })(App)
)
