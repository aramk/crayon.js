define([
  'module',
  'jquery', // src/jquery.js,
  'defaults',
  'langs/default' // TODO put in separate class
], function (module, $, defaults, defaultLang) {

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
      // The index of languages
      _index: null,
      // The cache of languages.
      _cache: null,
      // Options passed in on init.
      options: null,

      init: function (options) {
        this.options = options;
        this._cache = {};
        this._cache[options.defaultLangID] = defaultLang;
        var df = $.Deferred();
        if (!this._index) {
          $.getJSON(this.options.baseURL + 'langs/index.json', function (index) {
            index && console.log('index', index);
            this._index = index;
            df.resolve();
          }); // TODO handle failure
        } else {
          df.resolve();
        }
        return df;
      },

      get: function (id) {
        var me = this;
        var df = $.Deferred();
        var lang = this._cache[id];
        console.log('cache?', this._cache, id);
        if (lang) {
          df.resolve(lang);
        } else {
          if (me.exists(id)) {
            $.getScript(this._get(id))
                .done(function (lang) {
                  me._cache[id] = lang;
                  lang._compiled = null;
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

      compile: function (id, options) {
        var me = this;
        var df = $.Deferred();
        id = id || options.defaultLangID;
        this.get(id).then(function (lang) {
          if (!lang._compiled) {
            lang._compiled = lang.functions.compile(lang);
          }
          df.resolve(lang, lang._compiled);
        });
        return df;
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

      // TODO use a deferred
      this.langs.compile(atts.lang, this.options).then(function (lang, regex) {
        console.error('lang', lang, regex, value);
        // TODO refactor this into a single place and avoid infinite loops
        var matches;
        while ((matches = regex.exec(value)) != null) {
          // TODO better to avoid linear search...
          var index = lang.functions.getMatchIndex(matches);
          if (index > 1) {
            var elementID = lang._elementsArray[index - 1];
            console.error('match', matches, index, elementID);
          }
        }
      });
      console.log('value', value);
      return value;
    }

  };

  return Crayon;

});
