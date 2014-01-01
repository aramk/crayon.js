define([
  'defaults'
], function(defaults) {
  return {
    attrParser: function(attStr) {
      var match, atts = {};
      while ((match = defaults.reAttr.exec(attStr)) != null) {
        atts[match[1].trim()] = match[2].trim();
      }
      return atts;
    },
    getHtmlValue: function(pre) {
      return $(pre).html();
    },
    getTextValue: function(pre) {
      return $(pre).text();
    },
    setHtmlValue: function(pre, value) {
      $(pre).html(value);
    },
    setTextValue: function(pre, value) {
      $(pre).text(value);
    }
  };
});
