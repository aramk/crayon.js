define([
  'jquery',
  'util/regex',
  'util/format',
  'Elements',
  'defaults',
  'utility/Log'
], function($, regex, format, Elements, defaults, Log) {
  // TODO we need to extend this for other languages and override
  var Language = function(args) {
    $.extend(this, {
      _info: {},
      _elements: null,
      cssPrefix: defaults.pluginId
    });
  };
  $.extend(Language.prototype, {
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
  return Language;
});
