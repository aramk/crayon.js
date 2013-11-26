// TODO this isn't JSON - is this limiting?
// TODO if this is minified we should still be allowed to pass options to override it - since the minified code can't be modified

define([
  'jquery',
  'utility/Log'
], function ($, Log) {
  // TODO we need to extend this for other languages and override
  var lang = {
    info: {
      name: 'Default'
    },
    elements: {
      comment: /(\/\*.*?\*\/)|(\/\/.*?$)/,
      preprocessor: /(#.*?$)/,
      tag: null,
      string: /(["']).*?([^\\]|^)(["'])/, // TODO this matches the first character, we should ignore it,
      keyword: null,
      statement: ['enddeclare', 'endforeach', 'endswitch', 'continue', 'endwhile', 'foreach', 'finally', 'default', 'elseif', 'endfor', 'return', 'switch', 'assert', 'break', 'catch', 'endif', 'throw', 'while', 'then', 'case', 'else', 'goto', 'each', 'and', 'for', 'try', 'use', 'xor', 'and', 'not', 'end', 'as', 'do', 'if', 'or', 'in', 'is', 'to'],
      reserved: ['implements', 'instanceof', 'declare', 'default', 'extends', 'typedef', 'parent', 'super', 'child', 'clone', 'self', 'this', 'new'],
      type: ['cfunction', 'interface', 'namespace', 'function', 'unsigned', 'boolean', 'integer', 'package', 'double', 'struct', 'string', 'signed', 'object', 'class', 'array', 'float', 'short', 'false', 'char', 'long', 'void', 'word', 'byte', 'bool', 'null', 'true', 'enum', 'var', 'int'],
      modifier: ['protected', 'abstract', 'property', 'private', 'global', 'public', 'static', 'native', 'const', 'final'],
      entity: /(\b[a-z_]\w*\b(?=\s*\([^\)]*\)))|(\b[a-z_]\w+\b\s+(?=\b[a-z_]\w+\b))/,
      variable: /([A-Za-z_]\w*(?=\s*[=\[\.]))/, // TODO this can cause inconsistencies
      identifier: /\b[A-Za-z_]\w*\b/,
      constant: /\b[0-9][\.\w]*/,
      operator: {
        items: ['=&', '<<<', '>>>', '<<', '>>', '<<=', '=>>', '!==', '!=', '^=', '*=', '&=', '%=', '|=', '/=', '===', '==', '<>', '->', '<=', '>=', '++', '--', '&&', '||', '::', '#', '+', '-', '*', '/', '%', '=', '&', '|', '^', '~', '!', '<', '>', ':'],
        wordBounded: false
      },
      symbol: ['~', '`', '!', '@', '#', '$', '%', '(', ')', '_', '{', '}', '[', ']', '|', '\\', ':', ';', ',', '.', '?']
    },
    cssPrefix: 'crayon', // TODO repeat of pluginId in defaults, load from there?
    // Stores a list of the elements used during compilation. The order allows us to determine which group was matched.
    _elementsArray: [],
    extend: function (lang) {
      // Clone this language and deep merge the given one into it.
      return $.extend(true, $.extend(true, {}, this), lang);
    },
    regex: {
      // Whether to compile each element regex string into a RegExp object. Helps find invalid regexes.
      debug: true,
      backref: /\\(\d)\b/g,
      // TODO this isn't perfect, doesn't check that ( is not escaped.
      _group: /\(.*?[^\\]\)/g,
      _groupRemove: /((?:[^\\]|^)\((?!\?))/g,
      _dotReplace: /([^\\]|^)\./g,
      expandBackrefs: function (regexStr) {
        var backrefMatches = this.matchAll(this.backref, regexStr);
        var backrefs = {};
        if (backrefMatches.length) {
          for (var i = 0; i < backrefMatches.length; i++) {
            backrefs[parseInt(backrefMatches[i][1])] = backrefMatches[i][0];
          }
          var groups = regexStr.match(this._group);
          for (var groupId in backrefs) {
            var group = groups[groupId - 1];
            regexStr = regexStr.replace(backrefs[groupId], group);
          }
        }
        return regexStr;
      },
      removeGroups: function (regexStr) {
        return regexStr.replace(this._groupRemove, '$1?:');
      },
      /**
       * JavaScript doesn't have the \s modifier to allow dots capturing whitespace, so this
       * replaces all unescaped dots to be changed to [\s|S].
       * @param regexStr The original regex.
       * @returns {String} The resulting regex.
       */
      replaceDots: function (regexStr) {
        return regexStr.replace(this._dotReplace, '$1[\\s\\S]');
      },
      // TODO put in utils
      regexToString: function (re) {
        var str = re.toString().replace(/\\/g, '\\\\');
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
      alternation: function (array, wordBounded) {
        wordBounded = typeof wordBounded == 'undefined' ? true : wordBounded;
        array.sort(function (a, b) {
          // Reverse sort the array of strings.
          return a.length < b.length ? 1 : (a.length > b.length ? -1 : 0);
        });
        var me = this;
        var cleaned = [];
        array.forEach(function (item) {
          // Escape regex characters.
          item = me.escape(item);
          item.length && cleaned.push(item);
        });
        var regex = cleaned.join('|');
        regex = wordBounded ? '\\b(' + regex + ')\\b' : regex;
        return new RegExp(regex);
      },
      escape: function (str) {
        return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      },
      addAlt: function (regex, altRegex) {
        return '(' + lang.compileElem(null, regex) + ')|(' + lang.compileElem(null, altRegex) + ')';
      },
      concat: function () {
        var element = arguments[0];
        var clone = element instanceof Array ? element.slice() : [];
        for (var i = 1; i < arguments.length; i++) {
          var arg = arguments[i];
          for (var j = 0; j < arg.length; j++) {
            clone.push(arg[j]);
          }
        }
        return clone;
      }
    },
    compile: function () { // TODO remove me arg
      var regexStr = '', me = this;
      me._elementsArray = [];
      for (var id in me.elements) {
        // TODO rather than remove groups, change algorithm to allow them for more complex regex with functions in elements
        var elem = me.elements[id];
        if (elem) {
          elem = this.compileElem(id, elem);
          regexStr += '(' + elem + ')|';
        }
      }
      if (regexStr.length) {
        // Remove trailing character
        regexStr = regexStr.substring(0, regexStr.length - 1);
      } else {
        Log.error('No elements compiled', me);
      }
      return new RegExp(regexStr, 'gmi');
    },
    compileElem: function (id, elem) {
      var me = this;
      id && me._elementsArray.push(id);
      if (elem === null || typeof elem === 'undefined') {
        return null;
      } else if (elem instanceof Array) {
        elem = me.regex.alternation(elem);
      } else if (elem instanceof Function) {
        elem = elem(me, id);
      } else if (elem instanceof Object && !(elem instanceof RegExp)) {
        // TODO avoided using getTypeOf, might be slower
        elem = me.regex.alternation(elem.items, elem.wordBounded);
      }
      elem = elem instanceof RegExp ? elem.source : elem;
      elem = elem.toString();
      elem = me.regex.expandBackrefs(elem);
      elem = me.regex.removeGroups(elem);
      elem = me.regex.replaceDots(elem);
      if (me.debug) {
        elem = new RegExp(elem);
      }
      return elem.toString();
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
    encodeEntities: function (value) {
      return String(value)
          .replace(/&/g, '&amp;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
    },
    decodeEntities: function (value) {
      return String(value)
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&');
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
      matchValue = this.encodeEntities(matchValue);
      return '<span class="' + lang.cssPrefix + '-' + args.element + '">' + matchValue + '</span>';
    },
    getMatchIndex: function (matches) {
      if (matches.length > 1) {
        for (var i = 1; i < matches.length; i++) {
          var match = matches[i];
          if (typeof match != 'undefined') {
            return i;
          }
        }
      }
      return null;
    },
    // TODO add to util, might also be too slow to use?
    getTypeOf: function (/*anything*/ object) {
      return Object.prototype.toString.call(object).slice(8, -1);
    }
  };
  return lang;
});
