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

const SYNC_BLOCK_FUNC_EXEC =
  ' #{SCRIPT_BLOCK} ' +
  ' #{FUNC_TO_EXEC}.apply(null, arguments);';

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

function injectScriptBlock(webdriverInstance, scriptBlock, funcNameToExec /* rest arguments will be provied to the function...*/) {
  var scriptArgs = [].slice.call(arguments, 3);
  var scriptStringToInject =SYNC_BLOCK_FUNC_EXEC.replace('#{SCRIPT_BLOCK}', scriptBlock);
  
  scriptStringToInject = scriptStringToInject.replace('#{FUNC_TO_EXEC}', funcNameToExec);

  scriptArgs.unshift(scriptStringToInject);
  return webdriverInstance.executeScript.apply(webdriverInstance, scriptArgs);
}

/**
 * Map all the enumerable properties of an object to script which contain each one of them
 * as a defined variable. Except strings types, whose values will be surrounded with 
 * single quote, all the other are defined as its string representation.
 *
 * NOTE: Functions are also mapped to their string representation, they aren't bound to the
 * object so they are strictly mapped as plain functions
 */
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
  injectScriptBlock: injectScriptBlock,
  objectPropertiesToScript: objectPropertiesToScript
};
