'use strict';

var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var Facade = require('../../lib/facade');

describe('root', function() {
  it ('should mixin the initialiser and call all constructor decorators', function(){
    var d1 = sinon.stub();
    var d2 = sinon.stub();
    var facade = Facade({test: 4}, [{root:{init:d1}},{root:{init:d2}}]);

    expect(facade).to.have.property('test').and.to.equal(4);
    expect(d1).to.have.been.calledOnce.and.calledWith(facade);
    expect(d2).to.have.been.calledOnce.and.calledWith(facade);
  });

  describe('#createList', function () {
    it('should have a child list which has a reference to back to the root, and call all createList decorators', function () {
      var facade = Facade({});

      expect(facade,
        'the root facade to have the "createList" method').to.have.property('createList').and.to.be.a('function');

      facade.createList();

      expect(facade,
        'the root facade to have the "childList" property').to.have.property('childList');

      expect(facade.childList,
        'the "childList" to reference the root facade').to.have.property('root').and.is.equal(facade);


    });
  });
//  describe('#destroy', function () {
//    it('should ', function () {
//      var facade = Facade({});
//
//    });
//  });
//  describe('#', function () {
//    it('should ', function () {
//      var facade = Facade({});
//
//    });
//  });
//  describe('#', function () {
//    it('should ', function () {
//      var facade = Facade({});
//
//    });
//  });
});

describe('nodeList', function() {
  describe('#addNode', function(){
    it ('should have a node in the list which has a reference to the list and to root', function(){
      var facade = Facade({});
    });
  });
});