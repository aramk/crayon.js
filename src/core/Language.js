define([
  'util/jquery',
  'lib/Class',
  'util/regex',
  'util/format',
  './Elements',
  'defaults',
  'utility/Log'
], function($, Class, regex, format, Elements, defaults, Log) {
  return Class.extend({

    init: function(args) {
      $.extend(this, {
        _info: {},
        _elements: null
      });
    },

    setInfo: function(info) {
      this._info = info;
    },
    getInfo: function() {
      return this._info;
    },
    setElements: function (elements) {
      this._elements = elements;
    },
    getElements: function () {
      return this._elements;
    },
    compile: function() {
      if (this._elements) {
        return this._elements.compile();
      } else {
        Log.error('No elements to compile', this);
      }
    }

  });
});
