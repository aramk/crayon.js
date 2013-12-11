define([
  'module',
  'jquery', // src/jquery.js,
  'defaults',
  'langs/default', // TODO put in separate class
  'utility/String',
  'utility/Log' // TODO prefix with "crayon"
], function(module, $, defaults, defaultLang, String, Log) {

  function Crayon(element, options) {
    this.element = element;
    this.options = $.extend({}, defaults, options);
    this.init();
    Log.info('Crayon init, options:', this.options, 'element:', this.element);
  }

  Crayon.prototype = {

    nodes: null,
    // TODO move to another class later
    langs: {
      // The cache of languages.
      _cache: null,
      // Options passed in on init.
      options: null,

      init: function(options) {
        this.options = options || {};
        this._cache = {};
        this.addToCache(options.defaultLangId, defaultLang);
      },

      get: function(id) {
        var me = this;
        var df = $.Deferred();
        var lang = this._cache[id];
        if (lang) {
          df.resolve(lang);
        } else {
          require(['langs/' + id], function(lang) {
            Log.info('Language loaded', id, lang);
            me.addToCache(id, lang);
            lang._compiled = null;
            df.resolve(lang);
          }, function(err) {
            // TODO verify this is called in IE 6-8.
            df.reject(err);
          });
        }
        return df;
      },

      getScript: function(url, options) {
        options = $.extend({
          dataType: 'script',
          cache: true,
          url: url
        }, options);
        return $.ajax(options);
      },

      addToCache: function(id, lang) {
        this._cache[id] = lang;
        $.extend(lang, this.options.lang);
      },

      compile: function(id, options) {
        var me = this;
        var df = $.Deferred();
        id = id || options.defaultLangId;
        this.get(id).then(function(lang) {
          if (!lang._compiled) {
            lang._compiled = lang.compile();
            Log.info('Compiled language', id, lang);
          }
          df.resolve(lang, lang._compiled);
        }, function(err) {
          Log.error('Could not load language', id);
          df.reject(err);
        });
        return df;
      }
    },

    // TODO move to separate file
    themes: {
      _cache: null,
      init: function(options) {
        // TODO refactor this with the languages
        this.options = options;
        this._cache = {};
        // Default theme is assumed to be bundled.
        this._cache[options.defaultThemeId] = true;
      },

      load: function(id) {
        var theme = this._cache[id];
        if (!theme) {
          var $css = $('<link rel="stylesheet" type="text/css">');
          $('head').append($css[0]);
          // TODO we need to decide on the folder structure for themes
          // TODO fallback to classic if this fails - perhaps we should create a style tag instead
          // and use $.get to detect failure.
          // TODO even better, we should be able to combine certain themes into the core.css and prevent need to load
          $css.attr('href', this.options.themeURL(id));
        }
      }
    },

    init: function() {
      var me = this;
      me.themes.init(me.options);
      me.langs.init(me.options);
      me.nodes = me.query();
      me.load(me.nodes);
    },

    /**
     * @returns {?HTMLElement[]} The elements within the selected element which
     * match our selector for finding code.
     */
    query: function() {
      return $(this.options.selector, this.element);
    },

    // TODO separate out code which manipulates or compiles
    load: function(nodes) {
      var me = this;
      nodes.each(function(i, node) {
        var $node = $(node);
        var atts = $(node).attr(me.options.attrSelector);
        var parsedAtts = me.options.attrParser(atts);
        node.crayon = {
          atts: parsedAtts
        };
        Log.info('Attributes for node', this.element, parsedAtts);
        me.compile(me.options.getTextValue(node), parsedAtts).then(function(output) {
          if (output && output.length) {
            me.options.setHtmlValue(node, output);
          } else {
            Log.error('Compilation returned no output', output);
          }
          $node.addClass(me.options.pluginId);
          var themeId = parsedAtts.theme || me.options.defaultThemeId;
          me.themes.load(themeId);
          $node.addClass(me.options.themeCssClass(themeId));
        }, function(err) {
          // TODO(aramk) handle this better?
          throw err;
        });
      });
    },

    // TODO rename to parse or highlight?
    // TODO assumes value has entities decoded.
    compile: function(input, atts) {
      var me = this, df = $.Deferred();
      this.langs.compile(atts.lang, this.options).then(function(lang, regexes) {
        input = lang.transformIndent(input);
        var matches = {}, // Index to match map.
            isMultiPass = regexes.length > 1, // Whether we need to process the input more than once.
            remainder = input; // Contains the input minus any matched segments.
        // TODO handle case of no regexes?

        console.error('input', input);

        $.each(regexes, function(i, regex) {
          var match,
              currIndex = 0,
              lastMatchIndex = null;
//          console.error('regex', regex);
          console.error('isMultiProcess', isMultiPass);
          while ((match = regex.exec(remainder)) != null) {
            // TODO better to avoid linear search...
            var matchIndex = lang.getMatchIndex(match),
                value = match[0];
            console.error('value', value, value.indexOf(lang.nullChar));
            if (isMultiPass && value.indexOf(lang.nullChar) >= 0) {
              Log.debug('Duplicate match, ignoring', value);
              continue;
            }
            if (matchIndex !== null) {
              var element = lang._elementsArrays[i][matchIndex - 1],
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
                var blank = value.replace(/\S/gm, lang.nullChar);
                remainder = String.splice(remainder, matchStartIndex, matchEndIndex, blank);
              }
            }
            console.error('remainder', remainder);
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
              regex = regexes[match.regexIndex];
          // Copy preceding value.
          output += me.filterOutput(lang, input.slice(currIndex, startIndex));
          // Delegate transformation to language.
          var segment = lang.transform(match.match[0], {
            element: match.element,
            value: input,
            regex: regex,
            startIndex: startIndex,
            match: match
          });
          // Substitute the transformation.
          output += segment;
          currIndex = endIndex;
        }
        // Copy remaining value.
        output += me.filterOutput(lang, input.slice(endIndex, input.length));

        console.error('matches', matches);
        df.resolve(output);
      }, function(err) {
        df.reject(err);
      });
      return df;
    },

    filterOutput: function(lang, input) {
      return lang.encodeEntities(input);
    }

  };

  return Crayon;

});
