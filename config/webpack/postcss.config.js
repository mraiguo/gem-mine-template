module.exports = {
  ident: 'postcss',
  plugins: [require('postcss-import')(), require('precss')(), require('postcss-cssnext')()]
}
