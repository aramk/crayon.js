define([
  'jquery',
  'regex',
  'Language',
  'Elements',
  'utility/Log'
], function($, regex, Language, Elements, Log) {
  // TODO(aramk) add a proper extends method.

  var elements = new Elements();
  elements.setElements({
    comment: /(\/\*.*?\*\/)|(\/\/.*?$)/,
    preprocessor: /(#.*?$)/,
    tag: null,
    string: /(["']).*?([^\\]|^)(["'])/, // TODO this matches the first character, we should ignore it,
    keyword: null,
    statement: regex.words(['enddeclare', 'endforeach', 'endswitch', 'continue', 'endwhile', 'foreach', 'finally', 'default', 'elseif', 'endfor', 'return', 'switch', 'assert', 'break', 'catch', 'endif', 'throw', 'while', 'then', 'case', 'else', 'goto', 'each', 'and', 'for', 'try', 'use', 'xor', 'and', 'not', 'end', 'as', 'do', 'if', 'or', 'in', 'is', 'to']),
    reserved: regex.words(['implements', 'instanceof', 'declare', 'default', 'extends', 'typedef', 'parent', 'super', 'child', 'clone', 'self', 'this', 'new']),
    type: regex.words(['cfunction', 'interface', 'namespace', 'function', 'unsigned', 'boolean', 'integer', 'package', 'double', 'struct', 'string', 'signed', 'object', 'class', 'array', 'float', 'short', 'false', 'char', 'long', 'void', 'word', 'byte', 'bool', 'null', 'true', 'enum', 'var', 'int']),
    modifier: regex.words(['protected', 'abstract', 'property', 'private', 'global', 'public', 'static', 'native', 'const', 'final']),
    entity: /(\b[a-z_]\w*\b(?=\s*\([^\)]*\)))|(\b[a-z_]\w+\b\s+(?=\b[a-z_]\w+\b))/,
    variable: /([A-Za-z_]\w*(?=\s*[=\[\.]))/, // TODO this can cause inconsistencies, just remove it.
    identifier: /\b[A-Za-z_]\w*\b/,
    constant: /\b[0-9][\.\w]*/,
    operator: regex.esc(['=&', '<<<', '>>>', '<<', '>>', '<<=', '=>>', '!==', '!=', '^=', '*=', '&=', '%=', '|=', '/=', '===', '==', '<>', '->', '<=', '>=', '++', '--', '&&', '||', '::', '#', '+', '-', '*', '/', '%', '=', '&', '|', '^', '~', '!', '<', '>', ':']),
    symbol: regex.esc(['~', '`', '!', '@', '#', '$', '%', '(', ')', '_', '{', '}', '[', ']', '|', '\\', ':', ';', ',', '.', '?'])
  });
  var Default = function () {
    this.setInfo({
      name: 'Default'
    });
    this.setElements(elements);
  };
  Default.prototype = new Language();
  return Default;

  // TODO we need to extend this for other languages and override
//  var lang = {
//    regex: regex,
//    // Stores a list of the elements used during compilation. The order allows us to determine which group was matched.
//    _elementsArrays: [],
//    cssPrefix: 'crayon', // TODO repeat of pluginId in defaults, load from there?
//    // A character which replaces matches as a placeholder to avoid matching twice. This should be a character which does not appear in your language regex definition.
//    nullChar: '\u263A',
//    // Changes the behaviour when extending.
//    // "add" will add element sets of the source language into the destination language. (recommended/default)
//    // "merge" will merge any missing elements from the source language into the destination language for only the first elements set. If more than one elements set exists for the source language, merging is too ambiguous and this option defaults to "add".
//    extendMode: "add",
//    _compilation: null,
//    extend: function(dest) {
//      // TODO separate from the language?
//      var source = this;
//      // Clone this language and deep merge the given one into it.
//      var deepCopy = $.extend(true, {}, source);
//      // Handle merging of the elements manually.
//      delete deepCopy.elements;
//      var deepMerge = $.extend(true, deepCopy, dest),
//          sourceElemArray = source.getElementsArray();
//      if (dest.extendMode === "merge" && sourceElemArray.length === 1) {
//        var sourceElements = $.extend(true, {}, sourceElemArray[0]);
//        var destElemArray = dest.getElementsArray();
//        if (destElemArray.length === 0 || !destElemArray[0]) {
//          // Destination elements set is empty, just copy across.
//          dest.elements = $.extend(true, {}, sourceElements);
//        } else {
//          // Merge any missing elements into the first.
//          var destElements = destElemArray[0];
//          for (var id in sourceElements) {
//            if (!(id in destElements)) {
//              destElements[id] = sourceElements[id];
//            }
//          }
//        }
//      } else {
//        if (!(dest.elements instanceof Array)) {
//          dest.elements = [dest.elements];
//        }
//        deepMerge.elements = dest.elements.concat(sourceElemArray);
//      }
////      console.error('deepMerge', deepMerge);
//      return deepMerge;
//    },
//    getElementsArray: function () {
//      return this.elements instanceof Array ? this.elements : [this.elements];
//    },
//    compile: function() { // TODO remove me arg
//      this._compilation = new Compilation();
//      this._compilation.setElements(this.elements);
//      return this._compilation.compile();
//    },
//    // TODO(aramk) put into utils
//    spacesInTabString: function() {
//      return new Array(this.spacesInTab).join(' ');
//    },
//    convertTabs: function(value) {
//      return value.replace(/\t/g, this.spacesInTabString());
//    },
//    convertSpaces: function(value) {
//      return value.replace(this.spacesInTabString(), '\\t');
//    },
//    encodeEntities: function(value) {
//      return String(value)
//          .replace(/&/g, '&amp;')
//          .replace(/"/g, '&quot;')
//          .replace(/'/g, '&#39;')
//          .replace(/</g, '&lt;')
//          .replace(/>/g, '&gt;');
//    },
//    decodeEntities: function(value) {
//      return String(value)
//          .replace(/&quot;/g, '"')
//          .replace(/&#39;/g, "'")
//          .replace(/&lt;/g, '<')
//          .replace(/&gt;/g, '>')
//          .replace(/&amp;/g, '&');
//    },
//    transformIndent: function(value) {
//      if (this.indent == 'spaces') {
//        value = this.convertTabs(value);
//      } else if (this.indent == 'tabs') {
//        value = this.convertSpaces(value);
//      }
//      return value;
//    },
//    // TODO use better name for value variable
//    transform: function(matchValue, args) {
//      matchValue = this.encodeEntities(matchValue);
//      return '<span class="' + lang.cssPrefix + '-' + args.element + '">' + matchValue + '</span>';
//    },
//    getMatchIndex: function(matches) {
//      if (matches.length > 1) {
//        for (var i = 1; i < matches.length; i++) {
//          var match = matches[i];
//          if (typeof match != 'undefined') {
//            return i;
//          }
//        }
//      }
//      return null;
//    },
//    // TODO add to util, might also be too slow to use?
//    getTypeOf: function(/*anything*/ object) {
//      return Object.prototype.toString.call(object).slice(8, -1);
//    }
//  };
//
//  // TODO remove
//  var re = regex;
//  lang.elements = {
//    comment: /(\/\*.*?\*\/)|(\/\/.*?$)/,
//    preprocessor: /(#.*?$)/,
//    tag: null,
//    string: /(["']).*?([^\\]|^)(["'])/, // TODO this matches the first character, we should ignore it,
//    keyword: null,
//    statement: re.words(['enddeclare', 'endforeach', 'endswitch', 'continue', 'endwhile', 'foreach', 'finally', 'default', 'elseif', 'endfor', 'return', 'switch', 'assert', 'break', 'catch', 'endif', 'throw', 'while', 'then', 'case', 'else', 'goto', 'each', 'and', 'for', 'try', 'use', 'xor', 'and', 'not', 'end', 'as', 'do', 'if', 'or', 'in', 'is', 'to']),
//    reserved: re.words(['implements', 'instanceof', 'declare', 'default', 'extends', 'typedef', 'parent', 'super', 'child', 'clone', 'self', 'this', 'new']),
//    type: re.words(['cfunction', 'interface', 'namespace', 'function', 'unsigned', 'boolean', 'integer', 'package', 'double', 'struct', 'string', 'signed', 'object', 'class', 'array', 'float', 'short', 'false', 'char', 'long', 'void', 'word', 'byte', 'bool', 'null', 'true', 'enum', 'var', 'int']),
//    modifier: re.words(['protected', 'abstract', 'property', 'private', 'global', 'public', 'static', 'native', 'const', 'final']),
//    entity: /(\b[a-z_]\w*\b(?=\s*\([^\)]*\)))|(\b[a-z_]\w+\b\s+(?=\b[a-z_]\w+\b))/,
//    variable: /([A-Za-z_]\w*(?=\s*[=\[\.]))/, // TODO this can cause inconsistencies, just remove it.
//    identifier: /\b[A-Za-z_]\w*\b/,
//    constant: /\b[0-9][\.\w]*/,
//    operator: re.esc(['=&', '<<<', '>>>', '<<', '>>', '<<=', '=>>', '!==', '!=', '^=', '*=', '&=', '%=', '|=', '/=', '===', '==', '<>', '->', '<=', '>=', '++', '--', '&&', '||', '::', '#', '+', '-', '*', '/', '%', '=', '&', '|', '^', '~', '!', '<', '>', ':']),
//    symbol: re.esc(['~', '`', '!', '@', '#', '$', '%', '(', ')', '_', '{', '}', '[', ']', '|', '\\', ':', ';', ',', '.', '?'])
//  };
//
//  return lang;
});
