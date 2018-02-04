module.exports = {
  ident: 'css',
  sourceMap: true,
  plugins: [require('postcss-import')(), require('precss')(), require('postcss-cssnext')()]
}
