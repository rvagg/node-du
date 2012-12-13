var assert     = require('assert')
  , mkfiletree = require('mkfiletree')
  , du         = require('./')

  , bigboy     = Array.apply(null, Array(1024 * 100)).map(function () { return 'aaaaaaaaaa' }).join('')

  , make       = function (callback) {
      mkfiletree.makeTemp('du', {
          a: bigboy
        , b: {
              c: bigboy
            , d: {
                  e: bigboy
                , f: bigboy
              }
          }
        , g: {
              h: bigboy
            , i: {
                  j: {}
              }
          }
      }, callback)
    }

make(function (err, dir) {
  if (err) throw err
  du(dir, function (err, size) {
    mkfiletree.cleanUp(function () {})
    if (err) throw err
    // write 5 x bigboys
    // account for 6 x directory entries, reasonably taking up a max of 8192b each
    assert(size - bigboy.length * 5 <= 8192 * 6)
  })
})


console.log('Running... no assertions means no worries!')

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err)
})