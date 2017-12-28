import React from 'react';
import { urlFor, Link } from 'cat-eye';

export default props => {
  return (
    <div>
      <span>yyyyy </span>
      <Link to={urlFor('examples.permission.x')}>goto page X</Link>
    </div>
  );
};
