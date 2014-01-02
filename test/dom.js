describe('DOM', function () {

  it('creates plugin', function (done) {
    var $html = $('<div></div><p></p><pre></pre><p></p><div><pre></pre></div><span></span>');
    require(['plugin', 'core/Crayon'], function (plugin, Crayon) {
      var $elem = $html.crayon(),
          name = 'crayon',
          data = $.data($elem[0], 'plugin_' + name);
      data.then(function (crayon) {
        expect(crayon instanceof Crayon).to.be.true;
        done();
      });
    });
  });

});
