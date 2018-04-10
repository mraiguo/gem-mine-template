import { asyncLoad } from 'global/util/async-load'

import Container from 'components/examples'
import List from 'components/examples/List'

export default {
  path: '/examples',
  component: Container,
  description: '一些示例',
  // 子路由
  sub: {
    list: {
      component: List,
      description: '简单示例列表页',
      index: true
    },
    constant: {
      path: '/constant',
      component: asyncLoad('components/examples/constant'),
      description: '常量使用例子'
    },
    action: {
      path: '/action',
      component: asyncLoad('components/examples/counter'),
      description: 'action使用例子'
    },
    params: {
      path: '/params/:id',
      component: asyncLoad('components/examples/params'),
      description: 'URL变量和参数例子'
    },
    request: {
      path: '/request',
      component: asyncLoad('components/examples/request'),
      description: '请求使用例子'
    },
    permission: {
      path: '/permission',
      permission: function (props) {
        return props.example.count > 10
      },
      redirect: 'examples.permission.y',
      description: '权限拦截例子',
      module: {
        x: {
          path: '/x',
          component: asyncLoad('components/examples/permission/X')
        },
        y: {
          path: '/y',
          component: asyncLoad('components/examples/permission/Y')
        }
      }
    },
    ui: {
      path: '/ui',
      description: 'UI 组件库示例',
      component: asyncLoad('components/examples/ui')
    }
  }
}
