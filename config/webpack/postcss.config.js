module.exports = {
  ident: 'postcss',
  sourceMap: true,
  plugins: [require('postcss-import')(), require('precss')(), require('postcss-cssnext')()]
}
