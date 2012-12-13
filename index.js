/* Copyright (c) 2012 Rod Vagg <@rvagg> */

var fs = require('fs')
  , path = require('path')
  , async = require('async')

module.exports = function (dir, callback) {
  fs.stat(dir = path.resolve(dir), function (err, stat) {
    if (!stat || !stat.isDirectory()) return callback(err, stat && stat.size)
    fs.readdir(dir, function (err, list) {
      if (err) return callback(err)
      async.map(
          list.map(function (f) { return path.join(dir, f) })
        , module.exports
        , function (err, sizes) {
            callback(err, sizes && sizes.reduce(function (p, s) { return p + s }, stat.size))
          }
      )
    })
  })
}