define([
  'jquery'
], function($) {
  return {
    // Strings
    pluginId: 'crayon',
    selector: 'pre',
    baseURL: '',
    defaultLangId: 'default',
    defaultThemeId: 'classic',
    themeDir: 'themes',
    attrSelector: 'data-crayon',
    // Regex
    // TODO must include global modifier, else infinite loop
    reAttr: /(\w+\s*):(\s*[^;]+)/g,
    // Override this object to mixin properties into the language.
    lang: {
      // Accepts 'spaces', 'tabs' or null to prevent transforming.
      indent: 'spaces',
      spacesInTab: 4,
      cache: true
    },
    // Methods
    attrParser: function(attStr) {
      var match, atts = {};
      while ((match = this.reAttr.exec(attStr)) != null) {
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
    },
    themeCssClass: function(id) {
      return this.pluginId + '-theme-' + id;
    },
    themeURL: function(id) {
      return this.themeDir + '/' + id + '.css';
    }
  };
});
