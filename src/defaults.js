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
    nullChar: '\u263A'
  };
});
