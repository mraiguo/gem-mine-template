import React from 'react'
import Loadable from 'react-loadable'
import { SUPPORT_IE8 } from 'config/constant'

// loading
const Loading = ({ isLoading, error }) => {
  if (isLoading) {
    return <div>loading...</div>
  } else if (error) {
    console.error(error)
    return <div>Sorry, we get some problems.</div>
  } else {
    return null
  }
}

export default function (p) {
  return Loadable({
    loader: () => {
      if (typeof p === 'function') {
        return p()
      } else {
        if (SUPPORT_IE8) {
          throw new Error(
            `你的项目需要支持 IE8，异步路由请使用 function 方式，例如: asyncLoad(() => import('components/examples/counter'))`
          )
        }
        return import(`../../${p}?chunk=${p}`)
      }
    },
    loading: Loading
  })
}
