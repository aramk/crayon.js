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
      var output = '';
      this.langs.compile(atts.lang, this.options).then(function (lang, regex) {
        console.error('lang', lang, regex, value);
        // TODO refactor this into a single place and avoid infinite loops
        var matches;
        // Current position in original value.
        var origIndex = 0;
        while ((matches = regex.exec(value)) != null) {
          // TODO better to avoid linear search...
          var matchIndex = lang.functions.getMatchIndex(matches);
          if (matchIndex !== null) {
            var element = lang._elementsArray[matchIndex - 1];
            console.error('match', matches, matchIndex, element);
            var matchValue = value.slice(matches.index, matches.index + matches[0].length);
            console.error('matchValue', matchValue);
            // Copy preceding value.
            output += value.slice(origIndex, matches.index);
            origIndex = matches.index + matchValue.length;
            // Delegate transformation to language.
            output += lang.functions.transform(matchValue, {
              element: element,
              value: value,
              regex: regex,
              matchIndex: matchIndex,
              matches: matches
            });
          }
        }
        // Copy remaining value.
        output += value.slice(origIndex, value.length);
      });
      console.log('value', value);
      return output;
    }

  };

  return Crayon;

});
