import React from 'react';
import { Routes } from 'cat-eye';
import Footer from './Footer';
import Header from './Header';
import style from './style';

export default props => {
  return (
    <div>
      <Header />
      <div className={style.body}>
        <Routes path="examples" />
      </div>
      <Footer />
    </div>
  );
};
