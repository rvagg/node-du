/* Copyright (c) 2012 Rod Vagg <@rvagg> */

var fs = require('fs')
  , path = require('path')
  , async = require('async')

function du (dir, options, callback) {
  if (typeof options == 'function') {
    callback = options
    options  = {}
  }

  dir = path.resolve(dir)
  if (options.filter && options.filter(dir))
    return callback(null, 0)

  fs.lstat(dir, function (err, stat) {
    if (err) return callback(err)

    if (!stat) return callback(null, 0)

    var size = options.disk ? (512 * stat.blocks) : stat.size

    if (!stat.isDirectory())
      return callback(null, size)

    fs.readdir(dir, function (err, list) {
      if (err) return callback(err)

      async.map(
          list.map(function (f) {
            return path.join(dir, f)
          })
        , function (f, callback) {
            return du(f, options, callback)
          }
        , function (err, sizes) {
            callback(
                err
              , sizes && sizes.reduce(function (p, s) {
                  return p + s
                }, size)
            )
          }
      )
    })
  })
}

module.exports = du
