const assert = require('assert')
const mkfiletree = require('mkfiletree')
const du = require('./')
const bigboy = Array.apply(null, Array(1024 * 100)).map(() => 'aaaaaaaaaa').join('')

async function make () {
  return mkfiletree.makeTemp('du', {
    a: bigboy,
    b: {
      c: bigboy,
      d: {
        e: bigboy,
        f: bigboy
      }
    },
    g: {
      h: bigboy,
      i: {
        j: {}
      }
    }
  })
}

async function test (asPromises) {
  let filter = { filter: (f) => /(a|e|f)$/.test(f) }
  let dir = await make()

  if (!asPromises) {
    du(dir, function (err, size) {
      assert.ifError(err)
      afterDu(size)
    })

    du(dir, filter, (err, size) => {
      assert.ifError(err)
      afterFilteredDu(size)
    })
  } else {
    return Promise.all([
      du(dir).then(afterDu),
      du(dir, filter).then(afterFilteredDu)
    ])
  }

  function afterDu (size) {
    mkfiletree.cleanUp()
    // write 5 x bigboys
    // account for 6 x directory entries, reasonably taking up a max of 8192b each
    let adjusted = size - bigboy.length * 5
    let expected = 8192 * 5
    assert(adjusted <= expected, 'adjusted size (' + size + ' -> ' + adjusted + ') <= ' + expected)
    console.log(`${asPromises}, ${size}, ${adjusted} <> ${expected}`)
  }

  function afterFilteredDu (size) {
    mkfiletree.cleanUp()
    let adjusted = size - bigboy.length * 3
    let expected = 8192 * 3
    assert(adjusted <= expected, 'leftover size (' + size + ' -> ' + adjusted + ') <= ' + expected)
    console.log(`${asPromises} filtered, ${size}, ${adjusted} <> ${expected}`)
  }
}

console.log('Running... no assertions means no worries')
test()
  .then(() => test(true)) // promises version
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
