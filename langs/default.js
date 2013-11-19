// TODO this isn't JSON - is this limiting?
// TODO if this is minified we should still be allowed to pass options to override it - since the minified code can't be modified
define(function () {
  // TODO we need to extend this for other languages and override
  var lang = {
    info: {
      name: 'Default'
    },
    elements: {
      comment: /(\/\*.*?\*\/)|(\/\/.*?$)/,
      string: /([^\\]|^)".*?([^\\]|^)"/, // TODO this matches the first character, we should ignore it,
      keyword: /print/ // TODO add ability to use lists and concat
      // '((?<!\\\\)".*?(?<!\\\\)")|((?<!\\\\)\'.*?(?<!\\\\)\')'
      // (?:[^\\]|^)".*?(?:[^\\]|^)"
    },
    cssPrefix: 'crayon', // TODO repeat of pluginId in defaults, load from there?
    _elementsArray: null,
    functions: { // TODO remove key?
      compile: function (me) { // TODO remove me arg
        var regexStr = '';
        me._elementsArray = [];
        for (var id in me.elements) {
          console.log('reElem', me.elements[id]);
          // TODO rather than remove groups, change algorithm to allow them for more complex regex with functions in elements
          var elem = me.elements[id];
          me._elementsArray.push(id);
//          elem = me.functions.convertLookbehinds(elem);
//          console.error('elem-1', elem);
//          var elem = me.functions.regexToString(elem);
          console.error('elem0', elem);
//          console.error('elem1', me.functions.regexToString(elem));
          elem = elem.toString();
          elem = elem.substring(1, elem.length - 1);
          elem = me.functions.removeGroups(elem);
          regexStr += '(' + elem + ')|';
        }
        if (regexStr.length) {
          // Remove trailing character
          regexStr = regexStr.substring(0, regexStr.length - 1);
        } else {
          console.error('No elements compiled', me);
        }
        console.error('regexStr', regexStr, new RegExp(regexStr, 'gmi'));
        return new RegExp(regexStr, 'gmi');
      },
      // TODO use better name for value variable
      transform: function (matchValue, args) {
        console.error('matchValue, args', matchValue, args);
        return '<span class="' + lang.cssPrefix + '-' + args.element + '">' + matchValue + '</span>';
      },
      getMatchIndex: function (matches) {
        console.error('matches', matches, matches.length);
        if (matches.length > 1) {
          for (var i = 1; i < matches.length; i++) {
            var match = matches[i];
            if (match) {
              return i;
            }
          }
        }
        return null;
      },
      _reGroupRemove: /((?:[^\\]|^)\()/g,
      removeGroups: function (regexStr) {
        return regexStr.replace(this._reGroupRemove, '$1?:');
      },
      regexToString: function (re) {
        var str = re.toString().replace(/\\/g, '\\\\');
//        console.error('re', re, str.substring(1, str.length - 1));
        return str.substring(1, str.length - 1);
      },
//      _reLookbehind: //g,
      convertLookbehinds: function () {
        // TODO needs some more thought
        // TODO convert "(?<!a)b" -> "[^a]b" but only works for a single character
        // TODO see http://stackoverflow.com/questions/641407/javascript-negative-lookbehind-equivalent
      }
    }
  };
  return lang;
});
