'use strict';

var _ = require('underscore');

var addDecorator = function(decorator, decorators) {
  if (decorator.init) {
    decorators.init.push(decorator.init);
  }
  if (decorator.destroy) {
    decorators.init.push(decorator.destroy);
  }
  if (decorator.addChild) {
    decorators.init.push(decorator.addChild);
  }
  if (decorator.removeChild) {
    decorators.init.push(decorator.removeChild);
  }
  if (decorator.move) {
    decorators.init.push(decorator.move);
  }
};

var createDecoratorComposition = function(composedDecorators, decorators, method) {
  composedDecorators[method] = function(obj) {
    decorators[method].forEach(function(decorator){
      decorator(obj);
    });
  };
};

var addDecoratorToNode = function (decorator, node) {
  if (decorator.init) {
    decorator.init(node);
  }

  for (var i = 0; i < node.children.length; i++) {
    var childNode = node.children[i];
    if (decorator.addChild) {
      decorator.addChild(childNode);
    }

    addDecoratorToNode(decorator, childNode);
  }
};

var mixinInit = function (facade, init) {
  if (init) {
    _.each(init, function (value, key) {
      facade[key] = value;
    });
  }
};

var updateParents = function (node, parent) {
  node.parent = parent;
  node.root = parent.root ? parent.root : parent;

  node.children.forEach(function (child) {
    updateParents(child, node);
  });
};

var nodeFacade = function (init, decorators, parentNode, index) {
  var node = {
    isNode: true,
    children: [],
    destroy: function () {
      if (!node.isDestroyed) {
        node.isDestroyed = true;

        if (node.parent) {
          node.removeChild(index);
        }

        node.children.forEach(function (node) {
          node.destroy();
        });

        decorators.destroy(node);

        return true;
      }
    },
    addChild: function (init, index, isReference) {
      if (index !== 0 && !index) {
        index = node.children.length;
      }

      var newNode;
      if (init.isNode) {
        newNode = init;
        newNode.index = index;
        if (!isReference) {
          updateParents(newNode, node);
        }
      } else {
        newNode = nodeFacade(init, decorators, node, index);
      }

      node.children.splice(index, 0, newNode);
      for (var i = index + 1; i < node.children.length; i++) {
        node.children[i].index++;
      }

      decorators.addChild(newNode);

      return newNode;
    },
    removeChild: function (index) {
      var oldNode = node.children[index];
      if (oldNode) {
        node.children.splice(index, 1);
        for (var i = index; i < node.children.length; i++) {
          node.children[i].index--;
        }

        decorators.removeChild(oldNode, node, index);

        return oldNode;
      }
    },
    move: function(newParent, newIndex) {
      var oldParent = node.parent;
      var oldIndex = node.index;

      oldParent.children.splice(oldIndex, 1);
      for (var i = oldIndex; i < oldParent.children.length; i++) {
        oldParent.children[i].index--;
      }

      node.parent = newParent;
      node.index = newIndex;
      newParent.children.splice(newIndex, 0, node);
      for (i = newIndex + 1; i < newParent.children.length; i++) {
        newParent.children[i].index++;
      }
      decorators.move([node, oldParent, oldIndex]);
    }
  };
  if (parentNode) {
    node.parent = parentNode;
    node.root = parentNode.root ? parentNode.root : parentNode;
    node.index = index;
  }

  mixinInit(node, init);

  decorators.init(node);

  return node;
};

module.exports = function (init, decorators) {
  var _decorators = {
    init: [],
    destroy: [],
    addChild: [],
    removeChild: [],
    move: []
  };
  decorators = decorators || [];
  decorators.forEach(function(decorator){
    addDecorator(decorator, _decorators);
  });
  var composedDecorators = {};
  createDecoratorComposition(composedDecorators, _decorators, 'init');
  createDecoratorComposition(composedDecorators, _decorators, 'destroy');
  createDecoratorComposition(composedDecorators, _decorators, 'addChild');
  createDecoratorComposition(composedDecorators, _decorators, 'removeChild');
  createDecoratorComposition(composedDecorators, _decorators, 'move');

  var root = {
    addDecorator: function (decorator) {
      addDecorator(decorator, _decorators);
      addDecoratorToNode(decorator, root);
    }
  };

  mixinInit(root, init);

  root = nodeFacade(root, composedDecorators);

  return root;
};