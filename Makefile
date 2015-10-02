example:
	@NODE_PATH=lib PORT=5080 ./node_modules/.bin/node-dev --harmony example/react/index.js

test:
	@./node_modules/.bin/mocha \
		--require should \
		--reporter spec

.PHONY: example test
