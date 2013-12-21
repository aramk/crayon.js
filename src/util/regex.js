define([
  'utility/Array'
], function(Array) {
  return {
    modifiers: 'gmi',
    _backref: /\\(\d)\b/g,
    // TODO this isn't perfect, doesn't check that ( is not escaped.
    _group: /\(.*?[^\\]\)/g,
    _groupRemove: /((?:[^\\]|^)\((?!\?))/g,
    _dotReplace: /([^\\]|^)\./g,
    expandBackrefs: function(regexStr) {
      var backrefMatches = this.matchAll(this._backref, regexStr);
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
        matches.push(match);
      }
      return matches;
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
    convertLookbehinds: function() {
      // TODO needs some more thought
      // TODO convert "(?<!a)b" -> "[^a]b" but only works for a single character
      // TODO see http://stackoverflow.com/questions/641407/javascript-negative-lookbehind-equivalent
    },
    toStr: function(regex) {
      return regex instanceof RegExp ? regex.source : regex.toString();
    },
    alt: function(array, escape) {
      array = Array.argsArray.apply(this, arguments);
      escape = escape === undefined ? false : escape === true;
      this.altSort(array);
      var me = this;
      var cleaned = [];
      $.each(array, function(i, item) {
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
      array = Array.argsArray.apply(this, arguments);
      return '\\b(?:' + this.alt(array, true) + ')\\b';
    },
    esc: function(array) {
      array = Array.argsArray.apply(this, arguments);
      return this.alt(array, true);
    }
  };
});
