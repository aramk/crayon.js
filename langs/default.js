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
      statement: ['enddeclare', 'endforeach', 'endswitch', 'continue', 'endwhile', 'foreach', 'finally', 'default', 'elseif', 'endfor', 'return', 'switch', 'assert', 'break', 'catch', 'endif', 'throw', 'while', 'then', 'case', 'else', 'goto', 'each', 'and', 'for', 'try', 'use', 'xor', 'and', 'not', 'end', 'as', 'do', 'if', 'or', 'in', 'is', 'to'],
      reserved: ['implements', 'instanceof', 'declare', 'default', 'extends', 'typedef', 'parent', 'super', 'child', 'clone', 'self', 'this', 'new'],
      type: ['cfunction', 'interface', 'namespace', 'function', 'unsigned', 'boolean', 'integer', 'package', 'double', 'struct', 'string', 'signed', 'object', 'class', 'array', 'float', 'short', 'false', 'char', 'long', 'void', 'word', 'byte', 'bool', 'null', 'true', 'enum', 'var', 'int'],
      modifier: ['protected', 'abstract', 'property', 'private', 'global', 'public', 'static', 'native', 'const', 'final'],
      entity: /(\b[a-z_]\w*\b(?=\s*\([^\)]*\)))|(\b[a-z_]\w+\b\s+(?=\b[a-z_]\w+\b))/,
      variable: /([A-Za-z_]\w*(?=\s*[=\[\.]))/,
      identifier: /\b[A-Za-z_]\w*\b/,
      constant: /\b[0-9][\.\w]*/,
//      operator: ['=&', '<<<', '>>>', '<<', '>>', '<<=', '=>>', '!==', '!=', '^=', '*=', '&=', '%=', '|=', '/=', '===', '==', '<>', '->', '<=', '>=', '++', '--', '&&', '||', '::', '', '#', '+', '-', '*', '/', '%', '=', '&', '|', '^', '~', '!', '<', '>', ':'],
      symbol: ['~', '`', '!', '@', '#', '$', '%', '(', ')', '_', '{', '}', '[', ']', '|', '\\', ':', ';', ',', '.', '?']
    },
    cssPrefix: 'crayon', // TODO repeat of pluginId in defaults, load from there?
    // Stores a list of the elements used during compilation. The order allows us to determine which group was matched.
    _elementsArray: null,
    regex: {
      // Whether to compile each element regex string into a RegExp object. Helps find invalid regexes.
      debug: true,
      backref: /\\(\d)\b/g,
      // TODO this isn't perfect, doesn't check that ( is not escaped.
      group: /\(.*?[^\\]\)/g,
      groupRemove: /((?:[^\\]|^)\((?!\?))/g,
      expandBackrefs: function (regexStr) {
        var backrefMatches = this.matchAll(this.backref, regexStr);
        var backrefs = {};
        if (backrefMatches.length) {
          for (var i = 0; i < backrefMatches.length; i++) {
            backrefs[parseInt(backrefMatches[i][1])] = backrefMatches[i][0];
          }
          var groups = regexStr.match(this.group);
          for (var groupId in backrefs) {
            var group = groups[groupId - 1];
            regexStr = regexStr.replace(backrefs[groupId], group);
          }
        }
        return regexStr;
      },
      removeGroups: function (regexStr) {
        return regexStr.replace(this.groupRemove, '$1?:');
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
      },
      alternation: function (array) {
        array.sort(function (a, b) {
          // Reverse sort the array of strings.
          return a.length < b.length ? 1 : (a.length > b.length ? -1 : 0);
        });
        var me = this;
        array = array.map(function (item) {
          // Escape regex characters.
          return me.escape(item);
        });
        return new RegExp('\\b(' + array.join('|') + ')\\b');
      },
      escape: function (str) {
        return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      }
    },
    compile: function (me) { // TODO remove me arg
      var regexStr = '';
      me._elementsArray = [];
      for (var id in me.elements) {
        console.log('reElem', me.elements[id]);
        // TODO rather than remove groups, change algorithm to allow them for more complex regex with functions in elements
        var elem = me.elements[id];
        if (elem) {
          me._elementsArray.push(id);
          if (elem instanceof Array) {
            elem = me.regex.alternation(elem);
          }
          elem = elem.toString();
          elem = elem.substring(1, elem.length - 1);
          elem = me.regex.expandBackrefs(elem);
          elem = me.regex.removeGroups(elem);
          if (me.debug) {
            elem = new RegExp(elem);
          }
          console.error('elem', elem);
          regexStr += '(' + elem.toString() + ')|';
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
    spacesInTabString: function () {
      return new Array(this.spacesInTab).join(' ');
    },
    convertTabs: function (value) {
      return value.replace(/\t/g, this.spacesInTabString());
    },
    convertSpaces: function (value) {
      return value.replace(this.spacesInTabString(), '\\t');
    },
    preTransform: function (value) {
      if (this.indent == 'spaces') {
        value = this.convertTabs(value);
      } else if (this.indent == 'tabs') {
        value = this.convertSpaces(value);
      }
      return value;
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
          if (typeof match != 'undefined') {
            return i;
          }
        }
      }
      return null;
    }
  };
  return lang;
});
