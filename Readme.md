
# www-bundle

  **Deprecated in favor of [webpack-www-bundle](http://github.com/lapwinglabs/webpack-www-bundle)**

  Opinionated asset pipeline for the koa front-end servers

## Installation

```js
npm install www-bundle
```

## Usage

```js
var bundle = require('www-bundle')
var join = require('path').join

// middleware
koa.use(bundle({ root: __dirname }))

// all the assets your frontend should listen to
bundle('react') // supports "browser" field in package.json
bundle('home.js')
bundle('home.css')
```

See the [react example](example/react) for the complete server implementation

## Stack

- [koa-bundle](https://github.com/koajs/bundle) (automatic etag, compression, gzip, sourcemap support)
- browserify ([babelify](https://github.com/babel/babelify), [envify](https://github.com/hughsk/envify), externalizes big assets like react and D3)
- postCSS ([postcss-import](https://github.com/postcss/postcss-import), [cssnext](https://github.com/cssnext/cssnext), [postcss-nested](https://github.com/postcss/postcss-nested))

This allows you to support both importing assets using CSS and requiring assets using JS.

## License

MIT
