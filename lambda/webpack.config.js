// const webpack = require('webpack')
// const path = require('path')

module.exports = {
  // plugins: [
  // ignore these plugins completely
  // new webpack.IgnorePlugin(/^(?:electron|ws)$/)
  // ]
  // module: {
  //   rules: [
  //     {
  //       test: /\.js$/,
  //       loader: 'babel-loader',
  //       exclude: /node_modules/,
  //       options: {
  //         presets: ['@babel/preset-env']
  //       }
  //     }
  //   ]
  // }
  externals: [
    (function () {
      var IGNORES = [
        'electron'
      ]
      return function (context, request, callback) {
        if (IGNORES.indexOf(request) >= 0) {
          return callback(null, "require('" + request + "')")
        }
        return callback()
      }
    })()
  ]
}
