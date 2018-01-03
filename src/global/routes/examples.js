import Container from 'components/examples'
import List from 'components/examples/List'
import Constant from 'components/examples/constant'
import Counter from 'components/examples/counter'
import X from 'components/examples/permission/X'
import Y from 'components/examples/permission/Y'
import Request from 'components/examples/request'
import Params from 'components/examples/params'
import UI from 'components/examples/ui'

export default {
  path: '/examples',
  component: Container, // 存在子路由，需要有个组件来放置路由
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
      component: Constant,
      description: '常量使用例子'
    },
    action: {
      path: '/action',
      component: Counter,
      description: 'action使用例子'
    },
    params: {
      path: '/params/:id',
      component: Params,
      description: 'URL变量和参数例子'
    },
    request: {
      path: '/request',
      component: Request,
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
          component: X
        },
        y: {
          path: '/y',
          component: Y
        }
      }
    },
    ui: {
      path: '/ui',
      description: 'UI 组件库示例',
      component: UI
    }
  }
}
