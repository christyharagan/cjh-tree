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
        root: {
          init: sinon.spy(),
          createList: sinon.spy(),
          moveNode: sinon.spy(),
          destroy: sinon.spy()
        },
        nodeList: {
          init: sinon.spy(),
          addNode: sinon.spy(),
          removeNode: sinon.spy(),
          destroy: sinon.spy()
        },
        node: {
          init: sinon.spy(),
          createList: sinon.spy(),
          destroy: sinon.spy()
        }
      },
      {
        root: {
          init: sinon.spy(),
          createList: sinon.spy(),
          moveNode: sinon.spy(),
          destroy: sinon.spy()
        },
        nodeList: {
          init: sinon.spy(),
          addNode: sinon.spy(),
          removeNode: sinon.spy(),
          destroy: sinon.spy()
        },
        node: {
          init: sinon.spy(),
          createList: sinon.spy(),
          destroy: sinon.spy()
        }
      }
    ]
  };
};

describe('root', function () {
  it('should mixin the initialiser and call all constructor decorators', function () {
    var $ = setup();

    var facade = Facade({test: 4}, $.decorators);

    expect(facade).to.have.property('test').and.to.equal(4);
    expect($.decorators[0].root.init).to.have.been.calledOnce.and.calledWith(facade);
    expect($.decorators[1].root.init).to.have.been.calledOnce.and.calledWith(facade);
  });

  describe('#createList', function () {
    it('should have a child list which has a reference to back to the root, and call all createList decorators', function () {
      var $ = setup();

      var facade = Facade({}, $.decorators);

      expect(facade,
        'the root facade to have the "createList" method').to.have.property('createList').and.to.be.a('function');

      var list = facade.createList({test: 5});

      expect(list).to.have.property('test').and.to.equal(5);

      expect(facade,
        'the root facade to have the "childList" property').to.have.property('childList').and.to.equal(list);

      expect(list,
        'the "childList" to reference the root facade').to.have.property('root').and.is.equal(facade);

      expect($.decorators[0].nodeList.init).to.have.been.calledOnce.and.calledWith(list);
      expect($.decorators[0].nodeList.init).to.have.been.calledOnce.and.calledWith(list);
    });
  });
  describe('#destroy', function () {
    it('should call destroy on all child lists, nodes, and call all destroy decorators', function () {
      var $ = setup();

      var facade = Facade({}, $.decorators);

      var list = facade.createList({});
      var node = list.addNode({});

      facade.destroy();

      expect($.decorators[0].root.destroy,
        'first root destroy decorator to have been called').to.have.been.calledOnce.and.calledWith(facade);
      expect($.decorators[1].root.destroy,
        'second root destroy decorator to have been called').to.have.been.calledOnce.and.calledWith(facade);

      expect($.decorators[0].nodeList.destroy,
        'first nodeList destroy decorator to have been called').to.have.been.calledOnce.and.calledWith(list);
      expect($.decorators[1].nodeList.destroy,
        'second nodeList destroy decorator to have been called').to.have.been.calledOnce.and.calledWith(list);

      expect($.decorators[0].node.destroy,
        'first node destroy decorator to have been called').to.have.been.calledOnce.and.calledWith(node);
      expect($.decorators[1].node.destroy,
        'second node destroy decorator to have been called').to.have.been.calledOnce.and.calledWith(node);
    });
  });
  describe('#moveNode', function () {
    it('should move the node and call all moveNode decorators', function () {
      var $ = setup();

      var facade = Facade({}, $.decorators);

      var list = facade.createList({});
      var node1 = list.addNode({});
      var node2 = list.addNode({});
      var list2 = node2.createList();

      facade.moveNode(node1, list2, 0);

      expect(list.nodes).to.have.length(1);
      expect(list.nodes[0]).to.equal(node2);
      expect(list2.nodes).to.have.length(1);
      expect(list2.nodes[0]).to.equal(node1);
      expect(node1.parentList).to.equal(list2);
      expect(node1.index).to.equal(0);

      expect($.decorators[0].root.moveNode).to.have.been.calledOnce.and.calledWith(sinon.match([node1, list, 0, list2, 0]));
      expect($.decorators[1].root.moveNode).to.have.been.calledOnce.and.calledWith(sinon.match([node1, list, 0, list2, 0]));
    });
  });
  describe('#addDecorator', function () {
    it('should ', function () {
      var $ = setup();

      var facade = Facade({}, []);

      var list = facade.createList({});
      var node = list.addNode({});

      facade.addDecorator($.decorators[0]);

      expect($.decorators[0].root.init).to.have.been.calledOnce.and.calledWith(facade);
      expect($.decorators[0].root.createList).to.have.been.calledOnce.and.calledWith(list);
      expect($.decorators[0].nodeList.init).to.have.been.calledOnce.and.calledWith(list);
      expect($.decorators[0].nodeList.addNode).to.have.been.calledOnce.and.calledWith(node);
      expect($.decorators[0].node.init).to.have.been.calledOnce.and.calledWith(node);
    });
  });
});

describe('nodeList', function () {
  describe('#addNode', function () {
    it('should have a node in the list which has a reference back to both the list and to root, and call all addNode and node.init decorators', function () {
      var $ = setup();

      var facade = Facade({}, $.decorators);

      var list = facade.createList({});
      var node = list.addNode({});

      expect(list.nodes).to.have.length(1);
      expect(list.nodes[0]).to.equal(node);
      expect(node.parentList).to.equal(list);
      expect(node.root).to.equal(facade);
      expect(node.index).to.equal(0);

      expect($.decorators[0].nodeList.addNode).to.have.been.calledOnce.and.calledWith(node);
      expect($.decorators[0].node.init).to.have.been.calledOnce.and.calledWith(node);

      expect($.decorators[1].nodeList.addNode).to.have.been.calledOnce.and.calledWith(node);
      expect($.decorators[1].node.init).to.have.been.calledOnce.and.calledWith(node);
    });
  });

  describe('#removeNode', function () {
    it('should remove the node from the list which has a reference back to both the list and to root, and call all removeNode decorators', function () {
      var $ = setup();

      var facade = Facade({}, $.decorators);

      var list = facade.createList({});
      var node = list.addNode({});

      var removedNode = list.removeNode(0);

      expect(list.nodes).to.be.empty;
      expect(removedNode).to.equal(node);

      expect($.decorators[0].nodeList.removeNode).to.have.been.calledOnce.and.calledWith(node);
      expect($.decorators[1].nodeList.removeNode).to.have.been.calledOnce.and.calledWith(node);
    });
  });
});

describe('node', function () {
  describe('#createList', function () {
    it('should have a child list which has a reference back to both the node and to root, and call all createList and nodeList.init decorators', function () {
      var $ = setup();

      var facade = Facade({}, $.decorators);

      var list = facade.createList({});
      var node = list.addNode({});

      expect(node,
        'the node to have the "createList" method').to.have.property('createList').and.to.be.a('function');

      var list2 = node.createList({test: 6});

      expect(list2).to.have.property('test').and.to.equal(6);

      expect(node,
        'the root facade to have the "childList" property').to.have.property('childList').and.to.equal(list2);

      expect(list2,
        'the "childList" to reference the node').to.have.property('parentNode').and.is.equal(node);

      expect(list2,
        'the "childList" to reference the root facade').to.have.property('root').and.is.equal(facade);

      expect($.decorators[0].nodeList.init).to.have.been.calledTwice.and.calledWith(list);
      expect($.decorators[1].nodeList.init).to.have.been.calledTwice.and.calledWith(list);

    });
  });
});