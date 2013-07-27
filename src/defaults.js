define([], function () {
  return {

    selector: 'pre',
    attrSelector: 'data-crayon',
    // TODO must include global modifier, else infinite loop
    reAttr: /(\w+\s*):(\s*[^;]+)/g,
    attrParser: function (attStr) {
      var match, atts = {};
      while ((match = this.reAttr.exec(attStr)) != null) {
        console.log('match', match);
        atts[match[1]] = match[2];
      }
      return atts;
    }

  };
});
