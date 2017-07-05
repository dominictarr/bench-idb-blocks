'use strict'

var databases = []

var idb = require('./idb')

function print () {
  var args = [].slice.call(arguments)
  var pre = document.createElement('pre')
  pre.innerText = args.join(', ')
  document.body.appendChild(pre)
  console.log.apply(console, args)
}

function runBench (size, batch_size, time, max, cb) {
  print(JSON.stringify({
    size: size,
    batch: batch_size,
    time: time/1000,
    max: max
  }))

  var buffer = new Buffer(size)

  console.log('bench')
  print('# cleaning up...')
  var s = Date.now()
  //NOTE: reopening the same database after destroying
  //takes AGES. I guess it's not really destroyed, just
  //marked as destroyed?
  idb.open('bench'+Date.now(), 'store', function (err, db) {
    print('# opened in:'+ (Date.now() - s))
    databases.push(db)
    if(err) throw err
    
    print('n, writes, mb, seconds, n/seconds, writes/seconds, mb/seconds')

    var start = Date.now()
    console.log('start', start)
    var n = 0
    var writes = 0
    var ts = Date.now()
    ;(function next() {
      var ary = []
      for(var i = 0; i < batch_size; i++)
        ary.push({key: ~~(Math.random()*n+i), value: buffer})
      n+= batch_size
      idb.batch(db, 'store', ary, function (err) {
        writes ++
        if(Date.now() - ts > 1000) {
          var seconds = (Date.now() - start)/1000
          var mb = (n*size)/1000000
          print(n, writes, mb, seconds, n/seconds, writes/seconds, mb/seconds)
          ts = Date.now()
        }

        if(++n < 100000 && time > (Date.now() - start))
          next()
        else {
          var seconds = (Date.now() - start)/1000
          var mb = (n*size)/1000000
          print(n, writes, mb, seconds, n/seconds, writes/seconds, mb/seconds)
          var hr = document.createElement('hr')
          document.body.appendChild(hr)
          cb()
        }
      })
    })()
  })

}

var settings = [
  [1024, 800, 5e3, 1000],
  [1024*2, 400, 5e3, 1000],
  [1024*4, 200, 5e3, 1000],
  [1024*8, 100, 5e3, 1000],
  [1024*16, 50, 5e3, 1000],
  [1024*32, 25, 5e3, 1000],
]

;(function next (i) {
  if(i >= settings.length) {
    return databases.forEach(function (db) {
      idb.destroy(db, function () {
        print('#destroyed', db.name)
      })
    })
  }
  runBench.apply(null, settings[i].concat(function () {
    next(i+1)
  }))
})(0)

