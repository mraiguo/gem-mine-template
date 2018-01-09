import { router } from 'cat-eye'

// 组件引入
import NotFound from 'components/common/exception/404'
import Forbidden from 'components/common/exception/403'

import Home from 'components/home'

// 路由引入
import examplesRoutes from './examples'

/**
 * 路由配置，包括：
 *   注入 state
 *   默认组件配置，例如404，403
 */
router.config({
  mapStateToProps: state => {
    return {
      example: state.example
    }
  },
  components: {
    NotFound,
    Forbidden
  }
})

/**
 * 路由注册
 * path: 必须 {string}，路径
 * component: 可选 {Component}，路由对应的渲染组件
 * permission: 可选 {function}，权限验证函数，无表示不需要权限验证，子路由、平级子模块会继承权限
 * sub: 可选 {array} 子路由
 * index: 可选 {boolean} 是否作为父路由的默认显示
 * module: 可选 {array} 平级子模块
 * redirect: 可选 {string} 跳转到某个路由，不能与 sub 共存
 * exact: 可选 {boolean}是否完全匹配
 */
router.register({
  home: {
    component: Home,
    index: true
  },
  examples: examplesRoutes
})
