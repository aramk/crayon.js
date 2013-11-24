define([
  'jquery'
], function ($) {
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
    attrParser: function (attStr) {
      var match, atts = {};
      while ((match = this.reAttr.exec(attStr)) != null) {
        atts[match[1]] = match[2];
      }
      return atts;
    },
    getValue: function (pre) {
      return $(pre).text();
    },
    setValue: function (pre, value) {
      $(pre).html(value);
    },
    themeCssClass: function (id) {
      return this.pluginId + '-theme-' + id;
    },
    themeURL: function (id) {
      return this.themeDir + '/' + id + '.css';
    }
  };
});
