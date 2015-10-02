/**
 * Module Dependencies
 */
var join = require('path').join
var bundle = require('../..')
var koa = require('koa')()
var fs = require('fs');

koa.use(bundle({ root: __dirname }))

bundle(join(__dirname, '/lib/lazy/index.js?external'))
bundle('react?external&parse=false')
bundle(join(__dirname, 'home.css'))
bundle(join(__dirname, 'home.js'))

koa.use(function *(next) {
  var str = yield function (done) {
    fs.readFile(__dirname + '/home.html', 'utf8', done);
  }

  this.body = str;
})

koa.listen(5080, function() {
  var addr = this.address();
  console.log('listening on [%s]:%s', addr.address, addr.port);
})
