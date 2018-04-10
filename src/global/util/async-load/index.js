import React, { Component } from 'react'
import Loadable from 'react-loadable'
import { SUPPORT_IE8 } from 'config/constant'
import Loading from './Loading'
import Idle from './Idle'

const _preloadCache = []

// async load component
export function asyncLoad(p, preload = true) {
  const mod = Loadable({
    loader: () => {
      if (typeof p === 'function') {
        return p()
      } else {
        if (SUPPORT_IE8) {
          throw new Error(
            `你的项目需要支持 IE8，异步路由请使用 function 方式，例如: asyncLoad(() => import('components/examples/counter'))`
          )
        }
        return import(`../../../${p}`)
      }
    },
    loading: Loading,
    delay: 300,
    timeout: 30000
  })
  if (preload) {
    _preloadCache.push(mod)
  }
  return mod
}

// preload
export class Preload extends Component {
  idle = false
  finish = false

  handleActive = () => {
    this.idle = false
  }
  handleIdle = () => {
    this.idle = true
    if (_preloadCache.length) {
      const mod = _preloadCache.shift()
      mod.preload().then(() => {
        if (this.idle) {
          this.handleIdle()
        }
      })
    } else {
      if (!this.finish) {
        this.finish = true
      }
    }
  }

  render() {
    return <Idle idleAction={this.handleIdle} activeAction={this.handleActive} />
  }
}
