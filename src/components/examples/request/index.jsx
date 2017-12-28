import React from 'react';
import { actions, getIn, smart } from 'cat-eye';
import style from './style';

const Cmp = props => {
  return (
    <div>
      <button className={style.btn} onClick={actions.example.corsGet}>
        request:get
      </button>{' '}
      <button className={style.btn} onClick={actions.example.corsPost}>
        request:post
      </button>
      <div className={style.response}>
        response: <span>{JSON.stringify(props.data)}</span>
      </div>
      <div className={style.tip}>
        <p>tip 1: get 请求一定概率服务端会延迟返回 或者 返回错误（打开控制台查看）</p>
        <p>tip 2: nginx反向代理 和 服务端代理需要服务端配合，请参看文档处理</p>
      </div>
    </div>
  );
};

export default smart(state => {
  return {
    data: getIn(state, 'example.data')
  };
})(Cmp);
