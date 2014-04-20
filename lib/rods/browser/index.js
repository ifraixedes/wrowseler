/* jshint browser: false, node: true */
'use strict';

const ASYNC_CALLBACK_EXTRACTION =
  ' var scriptArgs = [].slice.call(arguments, 0);' +
  ' var done = scriptArgs.pop();' +
  ' var func = #{func_def};' +
  ' func.apply(null, scriptArgs);';

const SYNC_FUNC_EXEC =
  ' var func = #{func_def};' +
  ' func.apply(null, arguments);';

function injectAsyncScript(webdriverInstance, options, func /* rest arguments will be provied to the function...*/) {
  var asyncScriptArgs;
  var scriptStringToInject = ASYNC_CALLBACK_EXTRACTION;
  
  if (typeof options === 'object') {
    asyncScriptArgs = [].slice.call(arguments, 3);
  
    if (options.callbackName)  {
      scriptStringToInject = scriptStringToInject.replace('done', options.callbackName);
    }
  } else {
    asyncScriptArgs = [].slice.call(arguments, 2);
    func = options;
  }

  scriptStringToInject = scriptStringToInject.replace('#{func_def}', func.toString());
  asyncScriptArgs.unshift(scriptStringToInject);
  return webdriverInstance.executeAsyncScript.apply(webdriverInstance, asyncScriptArgs);
}

function injectScript(webdriverInstance, func /* rest arguments will be provied to the function...*/) {
  var scriptArgs = [].slice.call(arguments, 2);

  scriptArgs.unshift(SYNC_FUNC_EXEC.replace('#{func_def}', func.toString()));
  return webdriverInstance.executeScript.apply(webdriverInstance, scriptArgs);
}

function objectPropertiesToScript(obj) {
  var objScript = '';

  for (let pName in obj) {
    let pValue = obj[pName];

    objScript += 'var ' + pName + '=';

    switch(typeof pValue) {
      case 'string':
        objScript += '\'' + pValue + '\''; 
        break;
      default: 
        objScript += pValue;
    }

    objScript += ';';
  }

  return objScript;
}

module.exports = {
  injectAsyncScript: injectAsyncScript,
  injectScript: injectScript,
  objectPropertiesToScript: objectPropertiesToScript
};
