var resolve = require('path').resolve
var Load = require('scriptloader')
var location = window.location
var sliced = require('sliced')
var Batch = require('batch')
var noop = function () {}

module.exports = loader

function loader (path, options, fn) {
  var requires = sliced(arguments)
  var done = requires.pop() || noop
  var options = requires.pop() || {}
  var batch = new Batch()

  if (!options.cwd) {
    throw new Error('need to specify a cwd: load(dep, { cwd: __dirname }, fn)')
  }

  console.log(options.cwd);

  requires.forEach(function(req) {
    try {
      return require(req)
    } catch (e) {}

    req = resolve(options.cwd, req)

    batch.push(function (next) {
      Load(location.origin + req, function(err) {
        if (err) return next(err)
        return next(null, require(req.replace(/^\//, '')))
      })
    })
  })

  batch.end(function(err, reqs) {
    if (err) return fn(err)
    fn.apply(null, [null].concat(reqs))
  })
}
