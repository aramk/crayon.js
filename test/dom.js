describe('DOM', function () {

  it('creates plugin', function (done) {
    // Each DOM node in this DIV is matched.
    var $html = $('<div><p></p><pre></pre><pre></pre><p></p><div><pre></pre></div><span></span></div>');
    require(['plugin', 'core/Crayon'], function (plugin, Crayon) {
      var $elem = $html.crayon(),
          name = 'crayon',
          data = $.data($elem[0], 'plugin_' + name);
      data.then(function (crayon) {
        expect(crayon instanceof Crayon).to.be.true;
        expect(crayon.nodes.length).to.equal(3);
        done();
      });
    });
  });

});
