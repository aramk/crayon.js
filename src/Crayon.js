define([
  'module',
  'jquery', // src/jquery.js,
  'defaults',
  'langs/default', // TODO put in separate class
  'utility/Log' // TODO prefix with "crayon"
], function (module, $, defaults, defaultLang, Log) {

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

      init: function (options) {
        this.options = options || {};
        this._cache = {};
        this.addToCache(options.defaultLangId, defaultLang);
      },

      get: function (id) {
        var me = this;
        var df = $.Deferred();
        var lang = this._cache[id];
        if (lang) {
          df.resolve(lang);
        } else {
          require(['langs/' + id], function (lang) {
            Log.info('Language loaded', id, lang);
            me.addToCache(id, lang);
            lang._compiled = null;
            df.resolve(lang);
          }, function (err) {
            // TODO verify this is called in IE 6-8.
            df.resolve(null);
          });
        }
        return df;
      },

      getScript: function (url, options) {
        options = $.extend({
          dataType: 'script',
          cache: true,
          url: url
        }, options);
        return $.ajax(options);
      },

      addToCache: function (id, lang) {
        this._cache[id] = lang;
        $.extend(lang, this.options.lang);
      },

      compile: function (id, options) {
        var me = this;
        var df = $.Deferred();
        id = id || options.defaultLangId;
        this.get(id).then(function (lang) {
          if (lang) {
            if (!lang._compiled) {
              lang._compiled = lang.compile(lang);
              Log.info('Compiled language', id, lang);
            }
            df.resolve(lang, lang._compiled);
          } else {
            !lang && Log.error('Could not load language', id);
            df.resolve(null);
          }
        });
        return df;
      }
    },

    // TODO move to separate file
    themes: {
      _cache: null,
      init: function (options) {
        // TODO refactor this with the languages
        this.options = options;
        this._cache = {};
        // Default theme is assumed to be bundled.
        this._cache[options.defaultThemeId] = true;
      },

      load: function (id) {
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

    init: function () {
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
    query: function () {
      return $(this.options.selector, this.element);
    },

    // TODO separate out code which manipulates or compiles
    load: function (nodes) {
      var me = this;
      nodes.each(function (i, node) {
        var $node = $(node);
        var atts = $(node).attr(me.options.attrSelector);
        var parsedAtts = me.options.attrParser(atts);
        node.crayon = {
          atts: parsedAtts
        };
        Log.info('Attributes for node', this.element, parsedAtts);
        me.compile(me.options.getTextValue(node), parsedAtts).then(function (output) {
          if (output && output.length) {
            me.options.setHtmlValue(node, output);
          }
          $node.addClass(me.options.pluginId);
          var themeId = parsedAtts.theme || me.options.defaultThemeId;
          me.themes.load(themeId);
          $node.addClass(me.options.themeCssClass(themeId));
        });
      });
    },

    // TODO rename to parse or highlight?
    // TODO assumes value has entities decoded.
    compile: function (value, atts) {
      var output = '', df = $.Deferred();
      this.langs.compile(atts.lang, this.options).then(function (lang, regex) {
        if (!lang) {
          df.resolve(null);
          return;
        }
        output = '';
        value = lang.preTransform(value);
        // TODO refactor this into a single place and avoid infinite loops
        var matches;
        // Current position in original value.
        var origIndex = 0;
        // TODO possible to replace with string.match()?
        var lastMatchIndex = null;
        while ((matches = regex.exec(value)) != null) {
          // TODO better to avoid linear search...
          var matchIndex = lang.getMatchIndex(matches);
          if (matchIndex !== null) {
            var element = lang._elementsArray[matchIndex - 1];
            var matchValue = value.slice(matches.index, matches.index + matches[0].length);
            // Copy preceding value.
            output += lang.encodeEntities(value.slice(origIndex, matches.index));
            origIndex = matches.index + matchValue.length;
            // Delegate transformation to language.
            output += lang.transform(matchValue, {
              element: element,
              value: value,
              regex: regex,
              matchIndex: matchIndex,
              matches: matches
            });
          }
          // Prevents infinite loops.
          if (lastMatchIndex == matches.index) {
            Log.warn('Match not found, aborting');
            break;
          }
          lastMatchIndex = matches.index;
        }
        // Copy remaining value.
        output += lang.encodeEntities(value.slice(origIndex, value.length));
        df.resolve(output);
      });
      return df;
    }

  };

  return Crayon;

});
