/* global ENV */
import React from 'react'
import { NAME } from 'config/constant'
import style from '../style'

export default props => {
  return (
    <div>
      <ul>
        <li>env：{ENV}</li>
        <li>该环境下的常量值: {NAME}</li>
      </ul>

      <div className={style.tip}>
        tip：可以尝试 npm start --env=dev 来设置env，部署时会自动获取机器上设置的 env 值，以此来获取例如不同 API
        地址等功能
      </div>
    </div>
  )
}
