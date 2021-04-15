module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/cardterminal/'
    : '/',
  devServer: {
    https: true
  },
  transpileDependencies: [
    'vuetify'
  ],
  configureWebpack: {
    
  }
}
