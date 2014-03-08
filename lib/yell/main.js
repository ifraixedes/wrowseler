'use strict';

var seleniumWebdriver = require('selenium-webdriver');
var webdriver = new seleniumWebdriver.Builder().
     withCapabilities(seleniumWebdriver.Capabilities.chrome()).
        build();

webdriver.get("http://www.google.com");
webdriver.findElement(By.name("q")).sendKeys("webdriver");
webdriver.findElement(By.name("btnG")).click();
webdriver.getTitle().then(function(title) {
 assertEquals("webdriver - Google Search", title);
});
