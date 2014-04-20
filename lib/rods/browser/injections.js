/* jshint browser: false, node: true */
'use strict';

const ASYNC_CALLBACK_EXTRACTION =
  ' var scriptArgs = [].slice.call(arguments, 0);' +
  ' var done = scriptArgs.pop();' +
  ' var func = #{func_def};' +
  ' func.apply(null, scriptArgs);';

const ASYNC_BLOCK_CALLBACK_EXTRACTION =
  ' #{SCRIPT_BLOCK} ' +
  ' var scriptArgs = [].slice.call(arguments, 0);' +
  ' var done = scriptArgs.pop();' +
  ' #{FUNC_TO_EXEC}.apply(null, scriptArgs);';

const SYNC_FUNC_EXEC =
  ' var func = #{func_def};' +
  ' func.apply(null, arguments);';

const SYNC_BLOCK_FUNC_EXEC =
  ' #{SCRIPT_BLOCK} ' +
  ' #{FUNC_TO_EXEC}.apply(null, arguments);';

function injectAsyncFunction(webdriverInstance, options, func /* rest arguments will be provied to the function...*/) {
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

function injectAsyncScriptBlock(webdriverInstance, options, scriptBlock, funcNameToExec /* rest arguments will be provied to the function...*/) {
  var asyncScriptArgs;
  var scriptStringToInject = ASYNC_BLOCK_CALLBACK_EXTRACTION;

  if (typeof options === 'object') {
    asyncScriptArgs = [].slice.call(arguments, 4);

    if (options.callbackName)  {
      scriptStringToInject = scriptStringToInject.replace('done', options.callbackName);
    }
  } else {
    asyncScriptArgs = [].slice.call(arguments, 3);
    funcNameToExec = scriptBlock;
    scriptBlock = options;
  }

  scriptStringToInject = scriptStringToInject.replace('#{SCRIPT_BLOCK}', scriptBlock);
  scriptStringToInject = scriptStringToInject.replace('#{FUNC_TO_EXEC}', funcNameToExec);
  asyncScriptArgs.unshift(scriptStringToInject);
  return webdriverInstance.executeAsyncScript.apply(webdriverInstance, asyncScriptArgs);
}

function injectSyncFunction(webdriverInstance, func /* rest arguments will be provied to the function...*/) {
  var scriptArgs = [].slice.call(arguments, 2);

  scriptArgs.unshift(SYNC_FUNC_EXEC.replace('#{func_def}', func.toString()));
  return webdriverInstance.executeScript.apply(webdriverInstance, scriptArgs);
}

function injectSyncScriptBlock(webdriverInstance, scriptBlock, funcNameToExec /* rest arguments will be provied to the function...*/) {
  var scriptArgs = [].slice.call(arguments, 3);
  var scriptStringToInject =SYNC_BLOCK_FUNC_EXEC.replace('#{SCRIPT_BLOCK}', scriptBlock);
  
  scriptStringToInject = scriptStringToInject.replace('#{FUNC_TO_EXEC}', funcNameToExec);

  scriptArgs.unshift(scriptStringToInject);
  return webdriverInstance.executeScript.apply(webdriverInstance, scriptArgs);
}

module.exports = {
  asyncFunction: injectAsyncFunction,
  asyncScriptBlock: injectAsyncScriptBlock,
  syncFunction: injectSyncFunction,
  syncScriptBlock: injectSyncScriptBlock
};
