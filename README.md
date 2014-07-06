Wrowseler
==============

Wrowseler should be a a kind of a crawler framework which execute javascript, therefore it behaves as a real browser to be able to deal with web sites/pages are not friends of traditional crawlers.

However, it may be useful to test or look for security flaws, between others, in web sites/pages, although there are other frameworks to do these tasks in better way.

__NOTE__: This project is totally Work In Progress, unfourtunately there is no date when it may be in beta release, you can consider until that an alpha release.

## How to use it

Because it is still Work in  Progress, it has not been published in npm, so to install it you can point it in your `package.json` to this git reposirtory url. 

The Wrowseler package does not export a main module. You must reach the engine directly for `wrowseler/engine` and other stuff under the folders `wrowseler/rods` and `wrowseler/runflows`.

Right now the only chance to see how it works and what it does allow to do is walking through the tests.

## Technical specifications

It is built with `NodeJS` and `webdriver` node module which is the implementation of [Selenium WebDriver](http://docs.seleniumhq.org/projects/webdriver).
For this reason its constrains to use different browsers are the same that [Selenium WebDriver JS API implementation](http://selenium.googlecode.com/git/docs/api/javascript/index.html).

It uses `NodeJS 0.11` because it uses some of the features of the next release of Javascript, ECMA 6, named "harmony", as `generators`; therefore to use it you have to execute node with `--harmony` flag

## What does "wrowseler" mean?

Wrowseler doesn't mean absolutely nothing outside of this "scraping framework", I came up the name based in for what it is and the framework that it uses, therefore:
* Used framework: WebDriver, so `W` from it.
* Because it uses the mentioned framework, it executes a proper browser, so `rowse` from it.
* Because my aim is that it be a kind of a pseudo-crawler, `ler` come from it.

## License
Just MIT, read LICENSE file for more information.
