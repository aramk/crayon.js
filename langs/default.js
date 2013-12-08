// TODO this isn't JSON - is this limiting?
// TODO if this is minified we should still be allowed to pass options to override it - since the minified code can't be modified

define([
  'jquery',
  'utility/Log'
], function($, Log) {
  // TODO we need to extend this for other languages and override
  var lang = {
    info: {
      name: 'Default'
    },
    cssPrefix: 'crayon', // TODO repeat of pluginId in defaults, load from there?
    // Stores a list of the elements used during compilation. The order allows us to determine which group was matched.
    _elementsArray: [],
    extend: function(lang) {
      // Clone this language and deep merge the given one into it.
      return $.extend(true, $.extend(true, {}, this), lang);
    },
    regex: {
      modifiers: 'gmi',
      backref: /\\(\d)\b/g,
      // TODO this isn't perfect, doesn't check that ( is not escaped.
      _group: /\(.*?[^\\]\)/g,
      _groupRemove: /((?:[^\\]|^)\((?!\?))/g,
      _dotReplace: /([^\\]|^)\./g,
      expandBackrefs: function(regexStr) {
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
      removeGroups: function(regexStr) {
        return regexStr.replace(this._groupRemove, '$1?:');
      },
      /**
       * JavaScript doesn't have the \s modifier to allow dots capturing whitespace, so this
       * replaces all unescaped dots to be changed to [\s|S].
       * @param regexStr The original regex.
       * @returns {String} The resulting regex.
       */
      replaceDots: function(regexStr) {
        return regexStr.replace(this._dotReplace, '$1[\\s\\S]');
      },
      // TODO put in utils
      regexToString: function(re) {
        var str = re.toString().replace(/\\/g, '\\\\');
        return str.substring(1, str.length - 1);
      },
      matchAll: function(regex, string) {
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
      convertLookbehinds: function() {
        // TODO needs some more thought
        // TODO convert "(?<!a)b" -> "[^a]b" but only works for a single character
        // TODO see http://stackoverflow.com/questions/641407/javascript-negative-lookbehind-equivalent
      },
      argsArray: function(args) {
        return args instanceof Array ? args : Array.prototype.slice.apply(arguments);
      },
      toStr: function (regex) {
        return regex instanceof RegExp ? regex.source : regex.toString();
      },
      alt: function(array, escape) {
//        console.error('array in', array, arguments);
        array = this.argsArray.apply(this, arguments);
//        console.error('array args', array);
        escape = escape === undefined ? false : escape === true;
        this.altSort(array);
//        console.error('array sorted', array);
        var me = this;
        var cleaned = [];
        array.forEach(function(item) {
          // Items can be undefined, ignore these.
          if (item) {
            // TODO we could prevent RegExp from being escaped, but this would make the API confusing.
            item = me.toStr(item);
            if (escape) {
              // Escape regex characters.
              item = me.escape(item);
            }
            // Items can be empty strings, ignore these.
            item.length && cleaned.push(item);
          }
        });
        // TODO make this )|(
        var regex = cleaned.join(')|(?:');
        return '(?:' + regex + ')';
      },
      altSort: function(array) {
        array.sort(function(a, b) {
          if (typeof a == 'string' && typeof b == 'string') {
            // Reverse sort the array of strings.
            return a.length < b.length ? 1 : (a.length > b.length ? -1 : 0);
          } else if (typeof a != 'array' && typeof b == 'array') {
            this.altSort(b);
            return 0;
          } else if (typeof b != 'array' && typeof a == 'array') {
            this.altSort(a);
            return 0;
          }
        });
      },
      escape: function(str) {
        return this.toStr(str).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      },
      // Convenience methods.
      words: function(array) {
        array = this.argsArray.apply(this, arguments);
        return '\\b(?:' + this.alt(array, true) + ')\\b';
      },
      esc: function(array) {
        array = this.argsArray.apply(this, arguments);
        return this.alt(array, true);
      }
    },
    compile: function() { // TODO remove me arg
      var regexes = [], me = this;
      var elementsArray = me.elements instanceof Array ? me.elements : [me.elements];
      $.each(elementsArray, function (_, elements) {
        regexes.push(me.compileElements(elements));
      });
      return regexes;
    },
    compileElements: function(elements) {
      var regexStr = '', me = this;
      me._elementsArray = [];
      // TODO separate the logic from the data (language definition) while still allowing both to be overridden.
      for (var id in me.elements) {
        if (id.match(/^_/)) {
          // Ignore any elements with underscore prefix. These can be used to define modifiers for each set of elements.
          continue;
        }
        // TODO rather than remove groups, change algorithm to allow them for more complex regex with functions in elements
        var elem = me.elements[id];
        if (elem) {
          elem = me.compileElement(id, elem);
          id && me._elementsArray.push(id);
          regexStr += '(' + elem + ')|';
        }
      }
      if (regexStr.length) {
        // Remove trailing character
        regexStr = regexStr.substring(0, regexStr.length - 1);
      } else {
        Log.error('No elements compiled', me);
      }
      // TODO support more than one
      return new RegExp(regexStr, elements._modifiers || me.regex.modifiers);
    },
    compileElement: function(id, elem) {
      var me = this;
      if (elem === null || typeof elem === 'undefined') {
        return null;
      } else if (elem instanceof Array) {
        elem = me.regex.alt(elem);
      } else if (elem instanceof Function) {
        elem = elem(me, id);
      } else if (elem instanceof Object && !(elem instanceof RegExp)) {
        // TODO avoided using getTypeOf, might be slower
        elem = me.regex.alt(elem.items, elem.wordBounded);
      }
      elem = this.regex.toStr(elem);
      elem = me.regex.expandBackrefs(elem);
      elem = me.regex.removeGroups(elem);
      elem = me.regex.replaceDots(elem);
      return (new RegExp(elem)).source;
    },
    spacesInTabString: function() {
      return new Array(this.spacesInTab).join(' ');
    },
    convertTabs: function(value) {
      return value.replace(/\t/g, this.spacesInTabString());
    },
    convertSpaces: function(value) {
      return value.replace(this.spacesInTabString(), '\\t');
    },
    encodeEntities: function(value) {
      return String(value)
          .replace(/&/g, '&amp;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
    },
    decodeEntities: function(value) {
      return String(value)
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&');
    },
    transformIndent: function(value) {
      if (this.indent == 'spaces') {
        value = this.convertTabs(value);
      } else if (this.indent == 'tabs') {
        value = this.convertSpaces(value);
      }
      return value;
    },
    // TODO use better name for value variable
    transform: function(matchValue, args) {
      matchValue = this.encodeEntities(matchValue);
      return '<span class="' + lang.cssPrefix + '-' + args.element + '">' + matchValue + '</span>';
    },
    getMatchIndex: function(matches) {
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
    getTypeOf: function(/*anything*/ object) {
      return Object.prototype.toString.call(object).slice(8, -1);
    }
  };

  var re = lang.regex;
  lang.elements = {
    comment: /(\/\*.*?\*\/)|(\/\/.*?$)/,
    preprocessor: /(#.*?$)/,
    tag: null,
    string: /(["']).*?([^\\]|^)(["'])/, // TODO this matches the first character, we should ignore it,
    keyword: null,
    statement: re.words(['enddeclare', 'endforeach', 'endswitch', 'continue', 'endwhile', 'foreach', 'finally', 'default', 'elseif', 'endfor', 'return', 'switch', 'assert', 'break', 'catch', 'endif', 'throw', 'while', 'then', 'case', 'else', 'goto', 'each', 'and', 'for', 'try', 'use', 'xor', 'and', 'not', 'end', 'as', 'do', 'if', 'or', 'in', 'is', 'to']),
    reserved: re.words(['implements', 'instanceof', 'declare', 'default', 'extends', 'typedef', 'parent', 'super', 'child', 'clone', 'self', 'this', 'new']),
    type: re.words(['cfunction', 'interface', 'namespace', 'function', 'unsigned', 'boolean', 'integer', 'package', 'double', 'struct', 'string', 'signed', 'object', 'class', 'array', 'float', 'short', 'false', 'char', 'long', 'void', 'word', 'byte', 'bool', 'null', 'true', 'enum', 'var', 'int']),
    modifier: re.words(['protected', 'abstract', 'property', 'private', 'global', 'public', 'static', 'native', 'const', 'final']),
    entity: /(\b[a-z_]\w*\b(?=\s*\([^\)]*\)))|(\b[a-z_]\w+\b\s+(?=\b[a-z_]\w+\b))/,
    variable: /([A-Za-z_]\w*(?=\s*[=\[\.]))/, // TODO this can cause inconsistencies
    identifier: /\b[A-Za-z_]\w*\b/,
    constant: /\b[0-9][\.\w]*/,
    operator: re.esc(['=&', '<<<', '>>>', '<<', '>>', '<<=', '=>>', '!==', '!=', '^=', '*=', '&=', '%=', '|=', '/=', '===', '==', '<>', '->', '<=', '>=', '++', '--', '&&', '||', '::', '#', '+', '-', '*', '/', '%', '=', '&', '|', '^', '~', '!', '<', '>', ':']),
    symbol: re.esc(['~', '`', '!', '@', '#', '$', '%', '(', ')', '_', '{', '}', '[', ']', '|', '\\', ':', ';', ',', '.', '?'])
  };

  return lang;
});
