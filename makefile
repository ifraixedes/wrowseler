export PATH := ./node_modules/.bin:$(PATH)

.PHONY : test lint all 

all: lint test

test:
	@mocha --harmony -R spec --recursive test

lint:
	jshint lib
	jshint --config test/.jshintrc test
