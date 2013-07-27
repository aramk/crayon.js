define([
  'jquery', // src/jquery.js,
  'defaults'
], function ($, defaults) {

  function Crayon(element, options) {
    console.error('construct');
    this.element = element;
    this.options = $.extend({}, defaults, options);
    this.init();
  }

  // Define plugin
  Crayon.prototype = {

    elems: null,

    init: function () {
      console.error('init');
      this.elems = this.query();
      this.load(this.elems);
    },

    query: function () {
      return $(this.options.selector, this.element);
    },

    load: function (elems) {
      var me = this;
      elems.each(function (i, pre) {
        var atts = $(pre).attr(me.options.attrSelector);
        var parsedAtts = me.options.attrParser(atts);
        pre.crayon = {
          atts: parsedAtts
        };
        console.log('atts', parsedAtts);
        var output = me.parse(me.options.getValue(pre), parsedAtts);
        if (output && output.length) {
          me.options.setValue(pre, output);
        }
        console.log('output', output);
      });
    },

    parse: function (value, atts) {
      // TODO Load language, cache
      // TODO Apply regex to code
      // TODO Return output
      console.log('value', value);
      return value;
    }

  };

  return Crayon;

});
