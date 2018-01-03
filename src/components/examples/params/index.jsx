import React from 'react'
import { queryString } from 'cat-eye'
import style from '../style'

export default props => {
  const { name } = queryString.parse(props.location.search)
  return (
    <div>
      hello, <span className={style.hot}>{name}</span>, your id:{' '}
      <span className={style.hot}>{props.match.params.id}</span>
      <p>地址：/examples/params/:id</p>
      <p>
        传参：urlFor('examples.params', {'{'}id: 233, name: 'robot'{'}'})
      </p>
    </div>
  )
}
