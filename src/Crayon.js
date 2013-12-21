define([
  'module',
  'jquery',
  'defaults',
  'Renderer',
  'Compiler',
  'langs/Default', // TODO put in separate class
  'langs/tags',
  // TODO rename utils to distinguish
  'util/dom',
  'util/format',
  'util/regex',
  'utility/String',
  'utility/Log' // TODO prefix with "crayon"
], function(module, $, defaults, Renderer, Compiler, Default, tags, dom, format, regex, String,
            Log) {

  var Crayon = function(element, options) {
    this.element = element;
    this.options = $.extend({}, defaults, options);
    this.renderer = new Renderer(this.options);
    this.compiler = new Compiler(this.options);
    this.init();
    Log.info('Crayon init, options:', this.options, 'element:', this.element);
  };

  Crayon.prototype = {

    nodes: null,

    init: function() {
      var me = this;
      me.themes.init(me.options);
      me.langs.init(me.options);
      me.nodes = me.query();
      me.highlight(me.nodes);
    },

    /**
     * @returns {?HTMLElement[]} The elements within the selected element which
     * match our selector for finding code.
     */
    query: function() {
      return $(this.options.selector, this.element);
    },

    // TODO separate out code which manipulates or compiles
    highlight: function(nodes) {
      var me = this;
      nodes.each(function(i, node) {

        var $node = $(node);
        var atts = $(node).attr(me.options.attrSelector);
        var parsedAtts = dom.attrParser(atts);
//        node.crayon = {
//          atts: parsedAtts
//        };
        Log.info('Attributes for node', this.element, parsedAtts);
        var input = dom.getTextValue(node);
        input = format.transformIndent(input);
        me.compile({
          input: input,
          langId: parsedAtts.lang
        }).then(function(output) {
            me.renderer.render({
              node: node,
              output: output,
              atts: parsedAtts
            });
            // TODO implement
            // me.themes.load(themeId);
          }, function(err) {
            // TODO(aramk) handle this better?
            Log.error('Failed to compile', node, err);
          });
      });
    },

    compile: function(args) {
      var me = this;
      return me.langs.get(args.langId || this.options.defaultLangId).then(function(lang) {
        args.lang = lang;
        return me.compiler.compile(args)
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

  };

  return Crayon;

});
