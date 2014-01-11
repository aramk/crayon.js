define([
  'module',
  'util/jquery',
  'defaults',
  'lib/Class',
  './Renderer',
  './Compiler',
  'langs/Default', // TODO put in separate class
  'langs/tags',
  // TODO rename utils to distinguish
  'util/dom',
  'util/format',
  'util/regex',
  'utility/String',
  'utility/Log' // TODO prefix with "crayon"
], function(module, $, defaults, Class, Renderer, Compiler, Default, tags, dom, format, regex,
            String, Log) {
  return Class.extend({

    init: function(options) {
      this.options = $.extend({}, defaults, options);
      Log.info('Crayon init, options:', this.options);
      this.renderer = new Renderer(this.options);
      this.compiler = new Compiler(this.options);
      var me = this;
      me.themes.init(me.options);
      me.langs.init(me.options);
      me.nodes = me.query();
    },

    /**
     * @returns {?HTMLElement[]} The elements within the selected element which
     * match our selector for finding code.
     */
    query: function(nodes) {
      return $(this.options.selector, nodes);
    },

    highlight: function(nodes) {
      // TODO(aramk) handle case of getting string.
      console.error('nodes', nodes.html());
      var me = this,
        dfs = [],
        dfAll = $.Deferred(),
        $elems = me.query($(nodes));

      $elems.each(function(i, elem) {
        var df = $.Deferred();
        dfs.push(df);
        var $elem = $(elem);
        var atts = $elem.attr(me.options.attrSelector);
        var parsedAtts = dom.attrParser(atts);
        Log.debug('Attributes for elem', $elem, parsedAtts);
        var input = dom.getTextValue(elem);
        input = format.transformIndent(input);
        me.compile({
          input: input,
          langId: parsedAtts.lang
        }).then(function(output) {
            if (input.length > 0 && (!output || output.length === 0)) {
              Log.error('Compilation returned no output', output);
            }
            me.renderer.render({
              node: elem,
              content: output,
              atts: parsedAtts
            });
            df.resolve(elem);
            // TODO implement
            // me.themes.load(themeId);
          }, function(err) {
            // TODO(aramk) handle this better?
            Log.error('Failed to compile', elem, err);
            df.reject(err);
          });
      });
      $.when(dfs).then(function () {
        dfAll.resolve($elems);
      }, function (err) {
        dfAll.reject(err);
      });
      return dfAll;
    },

    compile: function(args) {
      var me = this;
      return me.langs.get(args.langId || this.options.defaultLangId).then(function(lang) {
        args.lang = lang;
        return me.compiler.compile(args);
      });
    },

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
        this.setCacheLang(this.options.defaultLangId, new Default());
      },

      get: function(id) {
        var me = this;
        var df = $.Deferred();
        var lang = me.getCacheLang(id);
        if (lang) {
          df.resolve(lang);
        } else {
          require(['langs/' + id], function(LangClass) {
            if (LangClass) {
              Log.info('Language loaded', id);
              var lang = new LangClass();
              me.setCacheLang(id, lang);
              df.resolve(lang);
            } else {
              Log.error('Language failed to load', id, LangClass);
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

      setCacheLang: function(id, lang) {
        this._cache[id] = lang;
      },

      getCacheLang: function(id) {
        return this._cache[id];
      }
    },

    // TODO move to separate file
    themes: {
      // TODO reuse cache logic
      _cache: null,
      init: function(options) {
        // TODO refactor this with the languages
        this.options = options;
        this._cache = {};
        // Default theme is assumed to be bundled.
        this._cache[options.defaultThemeId] = true;
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
    }

  });
});
