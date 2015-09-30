/**
 * DEBUG=www-bundle
 */

var debug = require('debug')('www-bundle')

/**
 * Module Dependencies
 */

var str2js = require('browserify-string-to-js')
var extend = require('postcss-simple-extend')
var clearfix = require('postcss-clearfix')
var fontpath = require('postcss-fontpath')
var vars = require('postcss-simple-vars')
var readFile = require('cached-readfile')
var cssimport = require('postcss-import')
var nested = require('postcss-nested')
var relative = require('path').relative
var Browserify = require('browserify')
var assign = require('object-assign')
var NODE_PATH = process.env.NODE_PATH
var Bundle = require('koa-bundle')
var watchify = require('watchify')
var url = require('postcss-url')
var join = require('path').join
var postcss = require('postcss')
var cssnext = require('cssnext')
var _node_path;
var _plugins;

/**
 * Transforms
 */

var markdown = require('browserify-markdown')
var watchify = require('watchify')
var babelify = require('babelify')
var envify = require('envify')

/**
 * External libraries
 */

var externals = ['react', 'd3', 'jquery']

/**
 * Production
 */

var production = process.env.NODE_ENV === 'production'

/**
 * JS_files
 */

var js = {}

/**
 * Export `bundle`
 */

exports = module.exports = Bundle({ root: process.cwd() }, function (file, fn) {
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

  if (!production) {
    options = assign(options, {
      packageCache: {},
      fullPaths: true,
      cache: {}
    })
  }

  debug('javascript: file %j', file)
  debug('javascript: options: %j', options)

  if (js[file.path]) {
    return js[file.path].bundle(fn)
  }

  var b = Browserify(options)
    .external(externals)
    .on('error', fn)
    .add(file.path)
    .transform(str2js())
    .transform(markdown())
    .transform(babelify.configure({ optional: ['runtime'] }))
    .transform(envify)

  if (production) {
    js[file.path] = b
    return js[file.path].bundle(fn)
  } else {
    var w = js[file.path] = watchify(b)
    w.on('log', function(msg) {
      debug('recompiled: %s',msg);
    })
    w.bundle(fn)
  }
}

/**
 * CSS
 */

function css (file, fn) {
  debug('css: file %j', file)

  readFile(file.path, 'utf8', function (err, str) {
    if (err) return fn(err)
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
    noParse: true
  }

  if (!production) {
    options = assign(options, {
      packageCache: {},
      fullPaths: true,
      cache: {}
    })
  }

  if (js[file.path]) {
    return js[file.path].bundle(fn)
  }

  var b = Browserify(options)
    .on('error', fn)
    .require(file.path, { expose: file.mod, basedir: file.root })

  if (production) {
    js[file.path] = b
    return js[file.path].bundle(fn)
  } else {
    var w = js[file.path] = watchify(b)
    w.on('log', function(msg) {
      debug('recompiled: %s',msg);
    })
    w.bundle(fn)
  }
}

/**
 * Passthrough
 */

function passthrough (file, fn) {
  debug('passthrough: file %j', file);
  readFile(file.path, fn)
}

/**
 * Lazily load the plugins
 */

function plugins(root) {
  if (_plugins) return _plugins
  var np = node_path(root)
  debug('plugin NODE_PATH=%s', np)

  _plugins = [
    cssimport({ path: np ? np : [], glob: true, root: root, async: true }),
    nested(),
    clearfix(),
    fontpath(),
    vars(),
    url({
      url: function(url, decl, from, dirname, to, options) {
        if (http(url)) return url;
        return '/' + relative(root, join(dirname, url));
      }
    }),
    extend(),
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
