/**
 * 此文件会在两个地方生效：
 * 1. webpack-dev-server 会自动配置，本地开发自动代理
 * 2. 会往 request 对象中注入对应的方法，例如
 *    import {request} from 'cat-eye';
 *    const {example} = request;
 *    example.get/post ...
 *    这里的 example 就是一个包装过的 axios 对象
 */

const config = {
  example: {
    mode: 'cors',
    wds: {
      prefix: '/v1.0',
      url: 'http://cors.zmei.me'
    },
    defaults: {
      prefix: '/v1.0',
      url: 'http://cors.zmei.me'
    }
  }
}

module.exports = config
