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
      preprocessor: /(#.*?$)/,
      tag: null,
      string: /([^\\]|^)(["']).*?\1\2/, // TODO this matches the first character, we should ignore it,
      keyword: null,
      statement: null, // TODO
      reserved: null,
      type: null,
      modifier: null,
      entity: null,
      variable: null,
      identifier: /\b[A-Za-z_]\w*\b/,
      constant: /\b[0-9][\.\w]*/, // TODO
      operator: null,
      symbol: null
    },
    cssPrefix: 'crayon', // TODO repeat of pluginId in defaults, load from there?
    // Stores a list of the elements used during compilation. The order allows us to determine which group was matched.
    _elementsArray: null,
    functions: { // TODO remove key?
      compile: function (me) { // TODO remove me arg
        var regexStr = '';
        me._elementsArray = [];
        for (var id in me.elements) {
          console.log('reElem', me.elements[id]);
          // TODO rather than remove groups, change algorithm to allow them for more complex regex with functions in elements
          var elem = me.elements[id];
          if (elem) {
            me._elementsArray.push(id);
            elem = elem.toString();
            elem = elem.substring(1, elem.length - 1);
            elem = me.functions.expandBackrefs(elem);
            elem = me.functions.removeGroups(elem);
            regexStr += '(' + elem + ')|';
          }
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
      _reBackref: /\\(\d)\b/g,
      // TODO this isn't perfect, doesn't check that ( is not escaped.
      _reGroup: /\(.*?[^\\]\)/g,
      _reGroupRemove: /((?:[^\\]|^)\()/g,
      expandBackrefs: function (regexStr) {
        var backrefMatches = this.matchAll(this._reBackref, regexStr);
        var backrefs = {};
        if (backrefMatches.length) {
          for (var i = 0; i < backrefMatches.length; i++) {
            backrefs[parseInt(backrefMatches[i][1])] = backrefMatches[i][0];
          }
          var groups = regexStr.match(this._reGroup);
          for (var groupId in backrefs) {
            var group = groups[groupId - 1];
            regexStr = regexStr.replace(backrefs[groupId], group);
          }
        }
        return regexStr;
      },
      removeGroups: function (regexStr) {
        return regexStr.replace(this._reGroupRemove, '$1?:');
      },
      // TODO put in utils
      regexToString: function (re) {
        var str = re.toString().replace(/\\/g, '\\\\');
//        console.error('re', re, str.substring(1, str.length - 1));
        return str.substring(1, str.length - 1);
      },
      matchAll: function (regex, string) {
        var match = null, matches = [];
        while (match = regex.exec(string)) {
          var matchArray = [];
          for (i in match) {
            if (parseInt(i) == i) {
              matchArray.push(match[i]);
            }
          }
          matchArray.index = match.index;
          matches.push(matchArray);
        }
        return matches;
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
