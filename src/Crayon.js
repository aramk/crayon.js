define([
  'module',
  'jquery', // src/jquery.js,
  'defaults',
  'langs/Default', // TODO put in separate class
  'langs/tags',
  // TODO rename utils to distinguish
  'util/dom',
  'util/format',
  'util/regex',
  'utility/String',
  'utility/Log' // TODO prefix with "crayon"
], function(module, $, defaults, Default, tags, dom, format, regex, String, Log) {

  var Crayon = function (element, options) {
    this.element = element;
    this.options = $.extend({}, defaults, options);
    this.init();
    Log.info('Crayon init, options:', this.options, 'element:', this.element);
  };

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
        // TODO(aramk) pass in this.options to constructor to replace defaults.
        this.setCacheLang('Default', new Default());
      },

      get: function(id) {
        var me = this;
        var df = $.Deferred();
        var lang = me.getCacheLang(id);
        if (lang) {
          df.resolve(lang);
        } else {
          require(['langs/' + id], function(lang) {
            if (lang) {
              Log.info('Language loaded', id, lang);
              me.setCacheLang(id, lang);
              lang._compiled = null;
              df.resolve(lang);
            } else {
              Log.error('Language failed to load', id, lang);
              df.reject(null);
            }
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

      setCacheLang: function (id, lang) {
        this._cache[id] = lang;
      },

      getCacheLang: function (id) {
        return this._cache[id];
      },

      compile: function(id, options) {
        var me = this;
        var df = $.Deferred();
        id = id || options.defaultLangId;
        this.get(id).then(function(lang) {
          var compiled = lang.compile();
          Log.debug('Compiled language', id, lang);
          df.resolve(lang, compiled);
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
      themeCssClass: function(id) {
        return this.options.pluginId + '-theme-' + id;
      },
      themeURL: function(id) {
        return this.options.themeDir + '/' + id + '.css';
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
          $css.attr('href', this.themes.themeURL(id));
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
        var parsedAtts = dom.attrParser(atts);
        node.crayon = {
          atts: parsedAtts
        };
        Log.info('Attributes for node', this.element, parsedAtts);
        me.compile(dom.getTextValue(node), parsedAtts).then(function(output) {
          if (output && output.length) {
            dom.setHtmlValue(node, output);
          } else {
            Log.error('Compilation returned no output', output);
          }
          $node.addClass(me.options.pluginId);
          var themeId = parsedAtts.theme || me.options.defaultThemeId;
          me.themes.load(themeId);
          $node.addClass(me.themes.themeCssClass(themeId));
        }, function(err) {
          // TODO(aramk) handle this better?
          Log.error('Failed to compile', node, err);
        });
      });
    },

    // TODO rename to parse or highlight?
    // TODO assumes value has entities decoded.
    compile: function(input, atts) {
      var me = this, df = $.Deferred();
      // TODO(aramk) handle multi-language tags first by recursively calling compile for the appropriate language.

      // TODO separate this into format and language

      this.langs.compile(String.camelToTitleCase(atts.lang), this.options).then(function(lang, regexes) {
        input = format.transformIndent(input);
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
//            console.error('value', value, value.indexOf(lang.nullChar));
            if (isMultiPass && value.indexOf(lang.nullChar) >= 0) {
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
                var blank = value.replace(/\S/gm, lang.nullChar);
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
          output += me.filterOutput(lang, input.slice(currIndex, startIndex));
          // Delegate transformation to language.
          var segment = format.transform(match.match[0], {
            element: match.element,
            value: input,
            regex: re,
            startIndex: startIndex,
            match: match
          });
          // Substitute the transformation.
          output += segment;
          currIndex = endIndex;
        }
        // Copy remaining value.
        output += me.filterOutput(lang, input.slice(endIndex, input.length));

//        console.error('matches', matches);
        df.resolve(output);
      }, function(err) {
        df.reject(err);
      });
      return df;
    },

    filterOutput: function(lang, input) {
      return format.encodeEntities(input);
    }

  };

  return Crayon;

});
