define([
  'defaults'
], function(defaults) {
  return {
    // Methods
    attrParser: function(attStr) {
      var match, atts = {};
      while ((match = defaults.reAttr.exec(attStr)) != null) {
        atts[match[1]] = match[2];
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
