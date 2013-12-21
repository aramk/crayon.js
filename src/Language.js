define([
  'jquery',
  'regex',
  'format',
  'Elements',
  'defaults',
  'utility/Log'
], function($, regex, format, Elements, defaults, Log) {
  // TODO we need to extend this for other languages and override
  var Language = function(args) {
    $.extend(this, {
      _info: {},
      _elements: null,
      cssPrefix: defaults.pluginId
    });
  };
  $.extend(Language.prototype, {
    setInfo: function(info) {
      this._info = info;
    },
    getInfo: function() {
      return this._info;
    },
    compile: function() {

    },
  });
  return Language;
  var lang = {
    compile: function() { // TODO remove me arg
      this._compilation = new Compilation();
      this._compilation.setElements(this.elements);
      return this._compilation.compile();
    },
    // TODO add to util, might also be too slow to use?
    getTypeOf: function(/*anything*/ object) {
      return Object.prototype.toString.call(object).slice(8, -1);
    }
  };

  // TODO remove
  var re = regex;
  lang.elements = {
    comment: /(\/\*.*?\*\/)|(\/\/.*?$)/,
    preprocessor: /(#.*?$)/,
    tag: null,
    string: /(["']).*?([^\\]|^)(["'])/, // TODO this matches the first character, we should ignore it,
    keyword: null,
    statement: re.words(
      ['enddeclare', 'endforeach', 'endswitch', 'continue', 'endwhile', 'foreach', 'finally',
        'default', 'elseif', 'endfor', 'return', 'switch', 'assert', 'break', 'catch', 'endif',
        'throw', 'while', 'then', 'case', 'else', 'goto', 'each', 'and', 'for', 'try', 'use', 'xor',
        'and', 'not', 'end', 'as', 'do', 'if', 'or', 'in', 'is', 'to']),
    reserved: re.words(
      ['implements', 'instanceof', 'declare', 'default', 'extends', 'typedef', 'parent', 'super',
        'child', 'clone', 'self', 'this', 'new']),
    type: re.words(
      ['cfunction', 'interface', 'namespace', 'function', 'unsigned', 'boolean', 'integer',
        'package', 'double', 'struct', 'string', 'signed', 'object', 'class', 'array', 'float',
        'short', 'false', 'char', 'long', 'void', 'word', 'byte', 'bool', 'null', 'true', 'enum',
        'var', 'int']),
    modifier: re.words(
      ['protected', 'abstract', 'property', 'private', 'global', 'public', 'static', 'native',
        'const', 'final']),
    entity: /(\b[a-z_]\w*\b(?=\s*\([^\)]*\)))|(\b[a-z_]\w+\b\s+(?=\b[a-z_]\w+\b))/,
    variable: /([A-Za-z_]\w*(?=\s*[=\[\.]))/, // TODO this can cause inconsistencies, just remove it.
    identifier: /\b[A-Za-z_]\w*\b/,
    constant: /\b[0-9][\.\w]*/,
    operator: re.esc(
      ['=&', '<<<', '>>>', '<<', '>>', '<<=', '=>>', '!==', '!=', '^=', '*=', '&=', '%=', '|=',
        '/=', '===', '==', '<>', '->', '<=', '>=', '++', '--', '&&', '||', '::', '#', '+', '-', '*',
        '/', '%', '=', '&', '|', '^', '~', '!', '<', '>', ':']),
    symbol: re.esc(
      ['~', '`', '!', '@', '#', '$', '%', '(', ')', '_', '{', '}', '[', ']', '|', '\\', ':', ';',
        ',', '.', '?'])
  };

  return lang;
});
