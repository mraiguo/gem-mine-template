import React from 'react'
import { actions } from 'cat-eye'
import style from './style'
export default props => {
  return (
    <div className={style.footer}>
      <a href="javascript:void(0);" className={style.goback} onClick={actions.routing.goBack}>
        ❮ 返回
      </a>
    </div>
  )
}
