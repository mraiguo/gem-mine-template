/* global ENV, DEBUG */
export function importAll(modules) {
  if (modules) {
    modules.keys().forEach(key => {
      modules(key)
    })
  }
}

export function getCurrentProxyConfig(proxyConfig) {
  const config = {}
  Object.keys(proxyConfig).forEach(function (key) {
    let cfg
    let env = ENV
    const proxy = proxyConfig[key]
    cfg = proxy[env]
    if (!cfg) {
      // DEBUG 必然是本地开发
      if (DEBUG && proxy.wds) {
        cfg = proxyConfig[key].wds
        cfg.wds = true
        const prefix = cfg.prefix
        cfg.prefix = `/${key}_wds`
        cfg.wdsPrefix = cfg.prefix
        if (prefix) {
          cfg.prefix = cfg.prefix + '/' + prefix.replace(/^\//, '')
        }
      } else {
        cfg = proxy.defaults
      }
    }
    if (cfg) {
      cfg.env = ENV
      cfg.mode = proxy.mode || 'server'
      config[key] = cfg
    }
  })

  return config
}
