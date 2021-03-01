
module.exports = {
  // ignore electron from web3 deps
  // https://stackoverflow.com/questions/34427446/bundle-error-using-webpack-for-electron-application-cannot-resolve-module-elec
  // externals: [
  //   (function () {
  //     var IGNORES = [
  //       'electron'
  //     ]
  //     return function (context, request, callback) {
  //       if (IGNORES.indexOf(request) >= 0) {
  //         return callback(null, "require('" + request + "')")
  //       }
  //       return callback()
  //     }
  //   })()
  // ]
}
