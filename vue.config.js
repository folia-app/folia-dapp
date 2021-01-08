module.exports = {
  lintOnSave: false,
  runtimeCompiler: true,

  configureWebpack: {
    optimization: {
      splitChunks: {
        minSize: 10000,
        maxSize: 250000
      }
    }
  }
}
