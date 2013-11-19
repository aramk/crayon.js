define([
  'jquery'
], function ($) {
  return {
    pluginId: 'crayon',
    selector: 'pre',
    baseURL: '',
    defaultLangId: 'default',
    defaultThemeId: 'classic',
    themeDir: 'themes',
    attrSelector: 'data-crayon',
    // TODO must include global modifier, else infinite loop
    reAttr: /(\w+\s*):(\s*[^;]+)/g,
    // TODO collect regex in a single namespace?
    reLookbehind: '',
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
    themeCssClass: function (id) {
      return this.pluginId + '-theme-' + id;
    },
    themeURL: function (id) {
      return this.themeDir + '/' + id + '.css';
    }
  };
});
