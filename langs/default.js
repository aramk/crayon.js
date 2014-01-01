define([
  'util/jquery',
  'util/regex',
  'Language',
  'Elements',
  'utility/Log'
], function($, regex, Language, Elements, Log) {
  return Language.extend({

    init: function () {
      var elements = new Elements();
      elements.setElements({
        comment: /(\/\*.*?\*\/)|(\/\/.*?$)/,
        preprocessor: /(#.*?$)/,
        tag: null,
        string: /(["']).*?([^\\]|^)(["'])/, // TODO this matches the first character, we should ignore it,
        keyword: null,
        statement: regex.words(
          ['enddeclare', 'endforeach', 'endswitch', 'continue', 'endwhile', 'foreach', 'finally',
            'default', 'elseif', 'endfor', 'return', 'switch', 'assert', 'break', 'catch', 'endif',
            'throw', 'while', 'then', 'case', 'else', 'goto', 'each', 'and', 'for', 'try', 'use', 'xor',
            'and', 'not', 'end', 'as', 'do', 'if', 'or', 'in', 'is', 'to']),
        reserved: regex.words(
          ['implements', 'instanceof', 'declare', 'default', 'extends', 'typedef', 'parent', 'super',
            'child', 'clone', 'self', 'this', 'new']),
        type: regex.words(
          ['cfunction', 'interface', 'namespace', 'function', 'unsigned', 'boolean', 'integer',
            'package', 'double', 'struct', 'string', 'signed', 'object', 'class', 'array', 'float',
            'short', 'false', 'char', 'long', 'void', 'word', 'byte', 'bool', 'null', 'true', 'enum',
            'var', 'int']),
        modifier: regex.words(
          ['protected', 'abstract', 'property', 'private', 'global', 'public', 'static', 'native',
            'const', 'final']),
        entity: /(\b[a-z_]\w*\b(?=\s*\([^\)]*\)))|(\b[a-z_]\w+\b\s+(?=\b[a-z_]\w+\b))/,
        variable: /([A-Za-z_]\w*(?=\s*[=\[\.]))/, // TODO this can cause inconsistencies, just remove it.
        identifier: /\b[A-Za-z_]\w*\b/,
        constant: /\b[0-9][\.\w]*/,
        operator: regex.esc(
          ['=&', '<<<', '>>>', '<<', '>>', '<<=', '=>>', '!==', '!=', '^=', '*=', '&=', '%=', '|=',
            '/=', '===', '==', '<>', '->', '<=', '>=', '++', '--', '&&', '||', '::', '#', '+', '-', '*',
            '/', '%', '=', '&', '|', '^', '~', '!', '<', '>', ':']),
        symbol: regex.esc(
          ['~', '`', '!', '@', '#', '$', '%', '(', ')', '_', '{', '}', '[', ']', '|', '\\', ':', ';',
            ',', '.', '?'])
      });
      this.setInfo({
        name: 'Default'
      });
      this.setElements(elements);
    }

  });
});
