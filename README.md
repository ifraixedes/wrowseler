Keynote
==============

Wrowseler should be a a kind of a crawler framework which execute javascript, therefore it behaves as a real browser to be able to deal with web sites/pages are not friends of traditional crawlers.

However, it may be useful to test or look for security flaws, between others, in web sites/pages, although there are other frameworks to do these tasks in better way.

NOTE: This project is totally Work In Progress.

## Technical specifications

It is built with `nodejs` and `webdriver` node module which is the implementation of [Selenium WebDriver](http://docs.seleniumhq.org/projects/webdriver).

For this reason its constrains to use different browsers are the same that [Selenium WebDriver JS API implementation](http://selenium.googlecode.com/git/docs/api/javascript/index.html).

## What does "wrowseler" mean?

Wrowseler doesn't mean absolutely nothing outside of this "scraping framework", I came up the name based in for what it is and the framework that it uses, therefore:
* Used framework: WebDriver, so `W` from it.
* Because it uses the mentioned framework, it executes a proper browser, so `rowse` from it.
* Because my aim is that it be a kind of a pseudo-crawler, `ler` come from it.

## License
Just MIT, read LICENSE file for more information.
