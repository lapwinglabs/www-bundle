/**
 * Module Dependencies
 */

var cssimport = require('postcss-import')
var nested = require('postcss-nested')
var Browserify = require('browserify')
var Bundle = require('koa-bundle')
var join = require('path').join
var postcss = require('postcss')
var cssnext = require('cssnext')
var fs = require('fs')

/**
 * Transforms
 */

var babelify = require('babelify')
var envify = require('envify')

/**
 * External libraries
 */

var externals = ['react', 'd3', 'jquery']

/**
 * $NODE_PATH support
 */

var node_path = process.env.NODE_PATH && join(root, process.env.NODE_PATH)

/**
 * post-css plugins
 */

var plugins = [
  cssimport({ path: node_path ? node_path : [] }),
  cssnext({ import: false }),
  nested()
]

/**
 * Export `bundle`
 */

module.exports = Bundle(function (file, fn) {
  // jsx => js
  if (file.type === 'jsx') file.type = 'js'

  // handle externals
  if (~externals.indexOf(file.mod)) {
    return external(file, fn)
  }

  switch (file.type) {
    case 'js': return javascript(file, fn)
    case 'css': return css(file, fn)
  }
})

/**
 * Javascript
 */

function javascript (file, fn) {
  var options = {
    debug: file.debug,
    paths: node_path
  }

  Browserify(options)
    .on('error', fn)
    .external(externals)
    .add(file.path)
    .transform(babelify)
    .transform(envify)
    .bundle(fn)
}

/**
 * CSS
 */

function css (file, fn) {
  fs.readFile(file.path, 'utf8', function (err, str) {
    if (err) return fn(err)

    postcss(plugins)
      .process(str, { from: file.path })
      .then(function (result) {
        fn(null, result.css)
      })
      .catch(fn)
  })
}

/**
 * External
 */

function external (file, fn) {
  var options = {
    debug: file.debug,
    exposeAll: true,
    noparse: true
  }

  Browserify(options)
    .on('error', fn)
    .require(file.path, { expose: file.mod, basedir: file.root })
    .bundle(fn)
}
