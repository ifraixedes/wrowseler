/* jshint browser: false, node: true */
'use strict';

/**
 * Map all the enumerable properties of an object to script which contain each one of them
 * as a defined variable. Except strings types, whose values will be surrounded with 
 * single quote, all the other are defined as its string representation.
 *
 * NOTE: Functions are also mapped to their string representation, they aren't bound to the
 * object so they are strictly mapped as plain functions
 */
function objectPropertiesToScriptBlock(obj) {
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
  objectPropertiesToScriptBlock: objectPropertiesToScriptBlock
};
