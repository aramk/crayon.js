define([
  'defaults',
  'lib/Class',
  'util/regex',
  'util/format',
  'utility/String',
  'utility/Log'
], function(defaults, Class, regex, format, String, Log) {
  return Class.extend({

    options: null,

    init: function(options) {
      this.options = options || defaults;
    },

    compile: function(args) {
      var me = this,
//        df = $.Deferred(),
        input = args.input,
        lang = args.lang,
        id = String.camelToTitleCase();
      // TODO(aramk) handle multi-language tags first by recursively calling compile for the appropriate language.

      // TODO separate this into format and language

      var regexes = lang.compile();

//      this.langs.compile(id, this.options).then(function(lang, regexes) {
      var matches = {}, // Index to match map.
        isMultiPass = regexes.length > 1, // Whether we need to process the input more than once.
        remainder = input; // Contains the input minus any matched segments.
      // TODO handle case of no regexes?

//        console.error('input', input);

      $.each(regexes, function(i, re) {
        var match,
          currIndex = 0,
          lastMatchIndex = null;
//          console.error('regex', lang.info.name, regex);
//          console.error('isMultiProcess', isMultiPass);
//            console.error('regex', regex);
        while ((match = re.exec(remainder)) != null) {
//            console.error('match', match);
          // TODO better to avoid linear search...
          var matchIndex = regex.getMatchIndex(match),
            value = match[0];
          if (isMultiPass && value.indexOf(this.options.nullChar) >= 0) {
            Log.debug('Duplicate match, ignoring', value);
            continue;
          }
          if (matchIndex !== null) {
            // TODO this should be in the lang
            var element = lang.getElements().getElementAtIndex(i, matchIndex - 1),
              matchStartIndex = match.index,
              matchEndIndex = match.index + value.length;
            matches[matchStartIndex] = {
              startIndex: matchStartIndex,
              endIndex: matchEndIndex,
              element: element,
              regexIndex: i,
              match: match
            };
            currIndex = matchEndIndex;
            if (isMultiPass) {
              var blank = value.replace(/\S/gm, this.options.nullChar);
              remainder = String.splice(remainder, matchStartIndex, matchEndIndex, blank);
            }
          }
//            console.error('remainder', remainder);
          // Prevents infinite loops.
          if (lastMatchIndex == match.index) {
            Log.warn('Match not found, aborting');
            break;
          }
          lastMatchIndex = match.index;
        }
      });

      var output = '', currIndex = 0;
      for (var index in matches) {
        var match = matches[index],
          startIndex = match.startIndex,
          endIndex = match.endIndex,
          re = regexes[match.regexIndex];
        // Copy preceding value.
        output += me.transformOutput(input.slice(currIndex, startIndex));

        var segment = me.transformSegment({
          value: match.match[0],
          element: match.element,
          input: input,
          regex: re,
          startIndex: startIndex,
          match: match
        });
        // Substitute the transformation.
        output += segment;
        currIndex = endIndex;
      }
      // Copy remaining value.
      output += me.transformOutput(input.slice(endIndex, input.length));

//        console.error('matches', matches);
//        df.resolve(output);
//      }, function(err) {
//        df.reject(err);
//      });
//      return df;
      return output;
    },

    transformSegment: function(args) {
      var me = this, value = this.transformOutput(args.value);
      return '<span class="' + me.options.pluginId + '-' + args.element + '">' + value +
        '</span>';
    },

    transformOutput: function(input) {
      return format.encodeEntities(input);
    }

  });
});
