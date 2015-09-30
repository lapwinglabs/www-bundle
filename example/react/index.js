/**
 * Module Dependencies
 */
var koa = require('koa')()
var bundle = require('../..')
var fs = require('fs');

koa.use(bundle({ root: __dirname }))

bundle('react')
bundle('home.js')
bundle('home.css')

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
