'use strict';

var seleniumWb = require('selenium-webdriver');
var webdriver = new seleniumWb.Builder().
     withCapabilities(seleniumWb.Capabilities.chrome()).
        build();

webdriver.get("http://www.google.com");
webdriver.findElement(seleniumWb.By.name("q")).sendKeys("webdriver");
webdriver.findElement(seleniumWb.By.name("btnG")).click();
webdriver.findElement({tagName: 'body'})
.then(function(body) {
  console.log('ey you');
  return body.getInnerHtml();
})
.then(console.log, console.error)
