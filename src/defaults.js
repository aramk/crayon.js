define([
  'jquery'
], function ($) {
  return {
    selector: 'pre',
    attrSelector: 'data-crayon',
    // TODO must include global modifier, else infinite loop
    reAttr: /(\w+\s*):(\s*[^;]+)/g,
    attrParser: function (attStr) {
      var match, atts = {};
      while ((match = this.reAttr.exec(attStr)) != null) {
        atts[match[1]] = match[2];
      }
      return atts;
    },
    getValue: function (pre) {
      return $(pre).html();
    },
    setValue: function (pre, value) {
      $(pre).html(value);
    },
    baseURL: ''
  };
});
