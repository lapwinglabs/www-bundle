/**
 * DEBUG=www-bundle
 */

var debug = require('debug')('www-bundle')

/**
 * Module Dependencies
 */

var strip_comments = require('strip-css-singleline-comments/sync')
var str2js = require('browserify-string-to-js')
var extend = require('postcss-simple-extend')
var clearfix = require('postcss-clearfix')
var fontpath = require('postcss-fontpath')
var vars = require('postcss-simple-vars')
var cssimport = require('postcss-import')
var nested = require('postcss-nested')
var relative = require('path').relative
var Browserify = require('browserify')
var NODE_PATH = process.env.NODE_PATH
var Bundle = require('koa-bundle')
var url = require('postcss-url')
var join = require('path').join
var postcss = require('postcss')
var cssnext = require('cssnext')
var fs = require('fs')
var _node_path;
var _plugins;

/**
 * Transforms
 */

var markdown = require('browserify-markdown')
var babelify = require('babelify')
var envify = require('envify')

/**
 * External libraries
 */

var externals = ['react', 'd3', 'jquery']

/**
 * Export `bundle`
 */

module.exports = Bundle({ root: process.cwd() }, function (file, fn) {
  // jsx => js
  if (file.type === 'jsx') file.type = 'js'

  // handle externals
  if (~externals.indexOf(file.mod)) {
    return external(file, fn)
  }

  switch (file.type) {
    case 'js': return javascript(file, fn)
    case 'css': return css(file, fn)
    default: return passthrough(file, fn);
  }
})

/**
 * Javascript
 */

function javascript (file, fn) {
  var options = {
    debug: file.debug,
    paths: node_path(file.root),
    extensions: ['.jsx']
  }

  debug('javascript: file %j', file)
  debug('javascript: options: %j', options)

  Browserify(options)
    .on('error', fn)
    .external(externals)
    .add(file.path)
    .transform(str2js())
    .transform(markdown())
    .transform(babelify)
    .transform(envify)
    .bundle(fn)
}

/**
 * CSS
 */

function css (file, fn) {
  debug('css: file %j', file)

  fs.readFile(file.path, 'utf8', function (err, str) {
    if (err) return fn(err)
    str = strip_comments(str);
    postcss(plugins(file.root))
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
  debug('external javascript: file %j', file)

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

/**
 * Passthrough
 */

function passthrough (file, fn) {
  debug('passthrough: file %j', file);
  fs.readFile(file.path, fn)
}

/**
 * Lazily load the plugins
 */

function plugins(root) {
  if (_plugins) return _plugins
  var np = node_path(root)
  debug('plugin NODE_PATH=%s', np)

  _plugins = [
    cssimport({ path: np ? np : [], glob: true, root: root }),
    nested(),
    vars(),
    extend(),
    clearfix(),
    fontpath(),
    url({
      url: function(url, decl, from, dirname, to, options) {
        if (http(url)) return url;
        return '/' + relative(root, join(dirname, url));
      }
    }),
    cssnext({ import: false, url: false })
  ]

  return _plugins
}

/**
 * Lazily load the node_path
 */

function node_path(root) {
  return _node_path
    || (_node_path = NODE_PATH && join(root, NODE_PATH))
}

/**
 * Check if `url` is an HTTP URL.
 *
 * @param {String} path
 * @param {Boolean}
 * @api private
 */

function http(url) {
  return url.slice(0, 4) === 'http'
    || url.slice(0, 3) === '://'
    || false;
}
