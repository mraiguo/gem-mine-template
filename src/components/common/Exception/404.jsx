import React from 'react'
import { actions } from 'cat-eye'

export default props => {
  return (
    <div>
      404 not found!
      <a href="javascript:void(0);" onClick={actions.routing.goBack}>
        ❮ 返回
      </a>
    </div>
  )
}
