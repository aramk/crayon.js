define([
  './default',
  'utility/Log'
], function (lang, Log) {
  var regex = lang.regex, elements = lang.elements;
  // TODO we need to extend this for other languages and override
  return lang.extend({
    info: {
      name: 'PHP'
    },
    elements: {
      // TODO reduce boilerplate code.
      comment: function (me, id) {
        return regex.addAlt(elements[id], '\#.*?$');
      },
      string: function (me, id) {
        // TODO not working
        return regex.addAlt(elements[id], '<<<EOT.*?^EOT');
      },
      keyword: regex.concat(elements.keyword, ['unset','print','return','require_once','require','list','isset','include_once','include','eval','exit','empty','echo','die'], ['__NAMESPACE__','__METHOD__','__FUNCTION__','__LINE__','__FILE__','__DIR__','__CLASS__']),
      tag: /<\?php\b|<\?|\?>/,
      entity: null
    }
  });
});
