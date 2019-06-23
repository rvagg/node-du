/* Copyright (c) 2012 Rod Vagg <@rvagg> */

const fs = require('fs')
const path = require('path')
const map = require('map-async')

function du (dir, options, callback) {
  dir = path.resolve(dir)
  fs.lstat(dir, afterLstat)

  function afterLstat (err, stat) {
    if (err) {
      return callback(err)
    }

    if (!stat) {
      return callback(null, 0)
    }

    let size = options.disk ? (512 * stat.blocks) : stat.size

    if (!stat.isDirectory()) {
      return callback(null, !options.filter || options.filter(dir) ? size : 0)
    }

    fs.readdir(dir, afterReaddir)

    function afterReaddir (err, list) {
      if (err) {
        return callback(err)
      }

      map(
        list.map((f) => path.join(dir, f)),
        (f, callback) => du(f, options, callback),
        (err, sizes) => callback(err, sizes && sizes.reduce((p, s) => p + s, size))
      )
    }
  }
}

module.exports = function maybePromiseWrap (dir, options, callback) {
  if (typeof options !== 'object') {
    callback = options
    options = {}
  }

  if (typeof callback === 'function') {
    return du(dir, options, callback)
  }

  return new Promise((resolve, reject) => {
    callback = (err, data) => {
      if (err) {
        return reject(err)
      }
      resolve(data)
    }

    du(dir, options, callback)
  })
}
