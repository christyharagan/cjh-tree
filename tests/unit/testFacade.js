'use strict';

var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var Facade = require('../../lib/facade');

var setup = function () {
  return {
    decorators: [
      {
          init: sinon.spy(),
          moveNode: sinon.spy(),
          destroy: sinon.spy(),
          addNode: sinon.spy(),
          removeNode: sinon.spy()
      },
      {
        init: sinon.spy(),
        moveNode: sinon.spy(),
        destroy: sinon.spy(),
        addNode: sinon.spy(),
        removeNode: sinon.spy()
      }
    ]
  };
};

describe('root', function () {
  it('should mixin the initialiser and call all constructor decorators', function () {
    var $ = setup();

    var facade = Facade({test: 4}, $.decorators);

    expect(facade).to.have.property('test').and.to.equal(4);
    expect($.decorators[0].init,
      'init of the first decorator should be called once').to.have.been.calledOnce.and.calledWith(facade);
    expect($.decorators[1].init,
      'init of the second decorator should be called once').to.have.been.calledOnce.and.calledWith(facade);
  });

  describe('#destroy', function () {
    it('should call destroy on all child lists, nodes, and call all destroy decorators', function () {
      var $ = setup();

      var facade = Facade({}, $.decorators);

      var node = facade.addNode({});

      facade.destroy();

      expect($.decorators[0].destroy,
        'first root destroy decorator to have been called twice').to.have.been.calledTwice;
      expect($.decorators[0].destroy.firstCall,
        'first root destroy decorator to have its first call with facade').to.have.been.calledWith(node);
      expect($.decorators[0].destroy.secondCall,
        'first root destroy decorator to have its first call with node').to.have.been.calledWith(facade);

      expect($.decorators[1].destroy,
        'second root destroy decorator to have been called twice').to.have.been.calledTwice;
      expect($.decorators[1].destroy.firstCall,
        'second root destroy decorator to have its first call with facade').to.have.been.calledWith(node);
      expect($.decorators[1].destroy.secondCall,
        'second root destroy decorator to have its first call with node').to.have.been.calledWith(facade);
    });
  });
  describe('#moveNode', function () {
    it('should move the node and call all moveNode decorators', function () {
      var $ = setup();

      var facade = Facade({}, $.decorators);

      var node1 = facade.addNode({});
      var node2 = facade.addNode({});

      facade.moveNode(node1, node2, 0);

      expect(facade.children).to.have.length(1);
      expect(facade.children[0]).to.equal(node2);
      expect(node2.children).to.have.length(1);
      expect(node2.children[0]).to.equal(node1);
      expect(node1.parent).to.equal(node2);
      expect(node1.index).to.equal(0);
      expect(node2.index).to.equal(0);

      expect($.decorators[0].moveNode,
        'moveNode of the first decorator should be called once').to.have.been.calledOnce.and.calledWith(sinon.match([node1, facade, 0]));
      expect($.decorators[1].moveNode,
        'moveNode of the second decorator should be called once').to.have.been.calledOnce.and.calledWith(sinon.match([node1, facade, 0]));
    });
  });
  describe('#addDecorator', function () {
    it('should ', function () {
      var $ = setup();

      var facade = Facade({}, []);

      var node = facade.addNode({});

      facade.addDecorator($.decorators[0]);

      expect($.decorators[0].init).to.have.been.calledTwice;
      expect($.decorators[0].init.firstCall).to.have.been.calledWith(facade);
      expect($.decorators[0].init.secondCall).to.have.been.calledWith(node);
      expect($.decorators[0].addNode).to.have.been.calledOnce.and.calledWith(node);
    });
  });
});

describe('node', function () {
  describe('#addNode', function () {
    it('should have a node in the list which has a reference back to both the list and to root, and call all addNode and node.init decorators', function () {
      var $ = setup();

      var facade = Facade({}, $.decorators);

      var node = facade.addNode({});

      expect(facade.children).to.have.length(1);
      expect(facade.children[0]).to.equal(node);
      expect(node.parent).to.equal(facade);
      expect(node.root).to.equal(facade);
      expect(node.index).to.equal(0);

      expect($.decorators[0].addNode,
        'addNode of the first decorator should be called once').to.have.been.calledOnce.and.calledWith(node);
      expect($.decorators[0].init,
        'init of the first decorator should be called twice').to.have.been.calledTwice.and.calledWith(node);

      expect($.decorators[1].addNode,
        'addNode of the second decorator should be called once').to.have.been.calledOnce.and.calledWith(node);
      expect($.decorators[1].init,
        'init of the second decorator should be called twice').to.have.been.calledTwice.and.calledWith(node);
    });
  });

  describe('#removeNode', function () {
    it('should remove the node from the list which has a reference back to both the list and to root, and call all removeNode decorators', function () {
      var $ = setup();

      var facade = Facade({}, $.decorators);

      var node = facade.addNode({});

      var removedNode = facade.removeNode(0);

      expect(facade.children).to.be.empty;
      expect(removedNode).to.equal(node);

      expect($.decorators[0].removeNode,
        'removeNode of the first decorator should be called once').to.have.been.calledOnce.and.calledWith(node);
      expect($.decorators[1].removeNode,
        'removeNode of the second decorator should be called once').to.have.been.calledOnce.and.calledWith(node);
    });
  });
});