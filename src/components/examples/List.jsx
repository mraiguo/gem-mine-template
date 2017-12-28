import React from 'react';
import { Link, urlFor } from 'cat-eye';
import style from './style';

export default props => {
  return (
    <ul className={style.list}>
      <li>
        <Link to={urlFor('examples.constant')}>不同环境下的常量示例</Link>
      </li>
      <li>
        <Link to={urlFor('examples.action')}>action使用示例：计数器</Link>
      </li>
      <li>
        <Link to={urlFor('examples.params', { id: 233, name: 'robot' })}>路由URL变量和参数例子</Link>
      </li>
      <li>
        <Link to={urlFor('examples.request')}>请求示例（CORS方式）</Link>
      </li>

      <li>
        <Link to={urlFor('examples.permission')}>权限拦截：计数器需要大于10才能访问</Link>
      </li>
      <li>
        <Link to={'/examples/not-found'}>404 page (子路由)</Link>
        <Link to={'/path/to/not-found'}>404 page (全局)</Link>
      </li>
    </ul>
  );
};
