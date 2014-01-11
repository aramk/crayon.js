describe('DOM', function() {

  it('creates plugin', function(done) {
    // Each DOM node in this DIV is matched.
    var $html = $('<div><p></p><pre></pre><pre></pre><p></p><div><pre></pre></div><span></span></div>');
    require(['plugin', 'core/Crayon'], function(plugin, Crayon) {
      $html.crayon();
      var name = 'crayon',
        data = $.data($html[0], 'plugin_' + name);
      data.then(function(crayon) {
        expect(crayon instanceof Crayon).to.be.true;
        expect(crayon.nodes.length).to.equal(3);
        done();
      });
    });
  });

  it('highlights code into dom nodes', function(done) {
    var $html = $('<div><pre>if (true) { return 123; }</pre><p>123</p><pre>var a = 1 + 2; alert(a);</pre></div>');
    require(['plugin'], function(plugin) {
      $html.crayon().then(function(crayons) {
        expect(crayons.length).to.equal(2);
        var crayon = crayons[0];
        expect(crayon.nodes.length).to.equal(2);
        var node = crayon.nodes[0];
        expect(node === $('pre', $html).get(0)).to.be.true;
        expect($(node).html()).to.equal('');
        done();
      });
    });
  });

});
