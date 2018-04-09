/* global ENV */
/**
 * 系统全局常量
 */
// exports.TITLE = 'title'

exports.SUPPORT_IE8 = true

// 请根据 ENV（npm run xxx --env=yyy 得到的 env 值）来设置对应的key，例如下面的 dev、production
// local 是作为没有提供 ENV 时默认采用
const data = {
  // 本地配置
  local: {
    NAME: 'tom'
  },
  // 开发环境
  dev: {
    NAME: 'jerry'
  },
  // 生产环境
  production: {
    NAME: 'lucy'
  }
}

// 默认使用 local
const result = Object.assign({}, data[ENV || 'local'])
Object.keys(result).forEach(key => {
  exports[key] = result[key]
})
