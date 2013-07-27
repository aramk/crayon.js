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

    nodes: null,

    init: function () {
      console.error('init');
      this.nodes = this.query();
      this.load(this.nodes);
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
        var output = me.parse(me.options.getValue(node), parsedAtts);
        if (output && output.length) {
          me.options.setValue(node, output);
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
