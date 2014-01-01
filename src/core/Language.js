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

    _elements: null,
    _compiled: null,

    init: function(args) {
      this._info = {};
    },

    setInfo: function(info) {
      this._info = info;
    },

    getInfo: function() {
      return this._info;
    },

    setElements: function(elements) {
      this._elements = elements;
    },

    getElements: function() {
      return this._elements;
    },

    compile: function() {
      if (this._elements) {
        return this._elements.compile();
      } else {
        Log.error('No elements to compile', this);
        return null;
      }
    },

    isCompiled: function () {
      return this._elements && this._elements.isCompiled();
    }

  });
});
