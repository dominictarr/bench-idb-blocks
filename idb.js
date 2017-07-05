function _ (req, cb) {
  req.onsuccess = function (ev) {
    cb(null, req.result)
  }
  req.onerror = function (ev) {
    cb(req.error)
  }
  return req
}

function open (dbName, name, cb) {
  var env = typeof window == 'object' ? window : self;
  var req = _(env.indexedDB.open(dbName, 1), cb)
  req.onupgradeneeded = function (ev) {
    var db = req.result
    db.createObjectStore(name, {keyPath: ['key']})
  }
}


function destroy(db, cb) {
  _(indexedDB.deleteDatabase(db.name), cb)
}

function destroyAll (cb) {
  var i = indexedDB
  //doesn't work in firefox!
  if(!i.webkitGetDatabaseNames) return cb()
  _(i.webkitGetDatabaseNames(), function (err, names) {
    if(err) return cb(err)
    
    console.log(names)
    var n = Object.keys(names).length
    if(!n) return cb()
    for (var k in names) {
      _(i.deleteDatabase(names[k]), function () {
        if(--n) return
        cb()
      })
    }
  })
}

function batch(db, name, batch, cb) {
  var tx = db.transaction([name], 'readwrite'), err
  var m = null //wrong, if the database is not cleared...
  tx.oncomplete = function (ev) {
    cb(null, m)
  }
  tx.onabort = tx.onerror = function (error) { cb(err || error) }
  var store = tx.objectStore(name)

  var n = batch.length
  function onError (_err) {
    err = _err
    tx.abort()
  }
  batch.forEach(function (data) {
    _(store.put(data), function (err, value) {
      m = m == null ? value : value > m ? value : m
    })
  })
}

function get (db, name, key, cb) {
  if(!Number.isInteger(seq)) throw new Error('sequence must be integer, was:'+JSON.stringify(seq))
  var tx = db.transaction([name], 'readonly')
  _(tx.objectStore(name).get(seq), cb)
}

function last (db, name, cb) {

}

exports.open = open
exports.destroyAll = destroyAll
exports.destroy = destroy
exports.get = get
exports.batch = batch








