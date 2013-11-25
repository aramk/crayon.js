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
      comment: function (me, id) {
        console.error('!!!', me, id);
        console.error('regex', elements);
        return elements[id].source + '|(\#.*?$)';
//        return regex.mapString('comment', function (regex) {
//          return regex.source + '|(\#.*?$)';
//        })
      },
      tag: /<\?php\b|<\?|\?>/
    }
  });
});
