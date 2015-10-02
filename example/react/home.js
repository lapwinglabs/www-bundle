// make sure to add the proper NPM path to the "browser" field
var React = require('react');
var loader = require('loader')
var title = document.querySelector('.title')

console.log('loading: <Title/>');
loader('./lib/lazy/index.js', { cwd: __dirname }, function(err, Title) {
  console.log('loaded: <Title/>');
  if (err) throw err
  React.render(<Title />, title)
})
