// TODO this isn't JSON - is this limiting?
// TODO if this is minified we should still be allowed to pass options to override it - since the minified code can't be modified
define(function () {
  return {
    info: {
      name: 'Default'
    },
    elements: {
      comment: '(/\\*.*?\\*/)|(//.*?$)'
    },
    modifiers: 'gmi',
    functions: { // TODO remove key?
      compile: function (me) {
        var regexStr = '';
        for (var id in me.elements) {
          console.log('reElem', me.elements[id]);
          // TODO rather than remove groups, change algorithm to allow them for more complex regex with functions in elements
          var reElem = me.functions.removeGroups(me.elements[id]);
          console.log('reElem', reElem);
          regexStr += '(' + reElem + ')|';
        }
        if (regexStr.length) {
          // Remove trailing character
          regexStr = regexStr.substring(0, regexStr.length - 1);
        } else {
          console.error('No elements compiled', me);
        }
        return new RegExp(regexStr, me.modifiers);
      },
      removeGroups: function (regexStr) {
        return regexStr.replace(/((?:[^\\]|^)\()/g, '$1?:');
      }
    }
  };
});
