define([
  'module',
  'jquery', // src/jquery.js,
  'defaults',
  'langs/default' // TODO put in separate class
], function (module, $, defaults, defaultLang) {

  console.error('defaultLang', defaultLang);

  // TODO move to separate file
  var langs = {};
//  $.getJSON()

  function Crayon(element, options) {
    console.error('construct');
    this.element = element;
    this.options = $.extend({}, defaults, options);
    this.init();
  }

  // Define plugin
  Crayon.prototype = {

    nodes: null,
    // TODO move to another class later
    langs: {
      _index: null,
      _cache: null,
//      _default: defaultLang, // TODO need this?
      options: null,

      init: function (options) {
        this.options = options;
        this._cache = {
          // TODO put in options
          default: defaultLang
        };
        var df = $.Deferred();
        if (!this._index) {
          $.getJSON(this.options.baseURL + 'langs/index.json', function (index) {
            console.log('!!!', index);
            this._index = index;
            df.resolve();
          });
        } else {
          df.resolve();
        }
        return df;
      },

      get: function (id) {
        var me = this;
        var df = $.Deferred();
        var lang = this._cache[id];
        if (lang) {
          df.resolve(lang);
        } else {
          if (me.exists(id)) {
            $.getScript(this._get(id))
                .done(function (lang) {
                  me._cache[id] = lang;
                  lang._cached = false;
                  df.resolve(lang);
                }).fail(function () {
                  df.resolve(null);
                });
            df.resolve(null);
          } else {
            df.resolve(null);
          }
        }
        return df;
      },

      _get: function (id) {
        return this._index ? this._index[id] : null;
      },

      exists: function (id) {
        return this._index && id in this._index;
      },

      compile: function (value, options) {
        var me = this;
        options = $.extend({}, this.options, options);
        var id = options.lang || 'default'; // TODO put in the
        console.error('looking for lang', id);
        this.get(id).then(function (lang) {
          console.error('lang', lang);
        });
      }
    },

    init: function () {
      var me = this;
      console.error('init', me.options);
      me.langs.init(me.options).then(function () {
        me.nodes = me.query();
        me.load(me.nodes);
      });
    },

    query: function () {
      return $(this.options.selector, this.element);
    },

    load: function (nodes) {
      var me = this;
      nodes.each(function (i, node) {
        var atts = $(node).attr(me.options.attrSelector);
        var parsedAtts = me.options.attrParser(atts);
        node.crayon = {
          atts: parsedAtts
        };
        console.log('atts', parsedAtts);
        var output = me.compile(me.options.getValue(node), parsedAtts);
        if (output && output.length) {
          me.options.setValue(node, output);
        }
        console.log('output', output);
      });
    },

    compile: function (value, atts) {
      // TODO Load language, cache
      // TODO Apply regex to code
      // TODO Return output
      this.langs.compile(value, {
        lang: atts.lang
      });
      console.log('value', value);
      return value;
    }

  };

  return Crayon;

});
