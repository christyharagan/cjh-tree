'use strict';

var _ = require('underscore');

var composeDecorators = function (decorators, type, method) {
  if (decorators.length === 0) {
    return _.identity;
  } else {
    return function (obj) {
      _.each(decorators, function (decorator) {
        var forType = decorator[type];
        if (forType) {
          var forMethod = forType[method];
          if (forMethod) {
            forMethod(obj);
          }
        }
      });
    };
  }
};

var addDecorator = function (decorators, decorator, type, method) {
  var forType = decorator[type];
  if (forType) {
    var forTypes = decorators[type];
    if (!forTypes) {
      forTypes = {};
      decorators[type] = forTypes;
    }

    var forMethod = forType[method];
    if (forMethod) {
      var forMethods = forTypes[method];
      if (!forMethods) {
        forMethods = [];
        forTypes[method] = forMethods;
      }

      forMethods.push(method);

      return true;
    }
  }
};

var addDecoratorToNodeList = function (decorator, nodeList) {
  if (decorator.nodeList && decorator.nodeList.init) {
    decorator.nodeList.init(nodeList);
  }
  for (var i = 0; i < nodeList.nodes.length; i++) {
    var node = nodeList.nodes[i];
    if (decorator.node && decorator.node.init) {
      decorator.node.init(node);
    }
    if (decorator.nodeList && decorator.nodeList.addNode) {
      decorator.nodeList.addNode(node);
    }
    if (node.childList) {
      if (decorator.node && decorator.node.createList) {
        var childList = node.childList;
        decorator.node.createList(childList);
        addDecoratorToNodeList(decorator, childList);
      }
    }
  }
};

var mixinInit = function (facade, init) {
  if (init) {
    _.each(init, function (value, key) {
      facade[key] = value;
    });
  }
};


var nodeFacade = function (init, root, parentList, index, decorators) {
  var node = {
    index: index,
    root: root,
    parentList: parentList,
    createList: function (init) {
      node.childList = nodeListFacade(init, root, node, decorators);

      decorators.node.createList(node.childList);

      return node.childList;
    },
    destroy: function () {
      if (!node.isDestroyed) {
        node.isDestroyed = true;

        if (node.childList) {
          node.childList.destroy();
          delete node.childList;
        }

        decorators.node.destroy(node);

        return true;
      }
    }
  };

  mixinInit(node, init);

  decorators.node.init(node);

  return node;
};

var nodeListFacade = function (init, root, parentNode, decorators) {
  var nodeList = {
    root: root,
    nodes: [],
    parentNode: parentNode,

    addNode: function (init, index) {
      if (index !== 0 && !index) {
        index = nodeList.nodes.length;
      }

      var node = nodeFacade(init, root, nodeList, nodeList.nodes.length, decorators);

      nodeList.nodes.splice(index, 0, node);
      for (var i = index; i < nodeList.length; i++) {
        nodeList[i].index++;
      }

      decorators.nodeList.addNode(node);

      return node;
    },
    removeNode: function (index) {
      var node = nodeList.nodes[index];
      if (node) {
        nodeList.nodes.splice(index, 1);
        for (var i = index; i < nodeList.length; i++) {
          nodeList[i].index--;
        }

        decorators.nodeList.removeNode(node);

        return node;
      }
    },
    destroy: function () {
      if (!nodeList.isDestroyed) {
        nodeList.isDestroyed = true;

        decorators.nodeList.destroy(nodeList);

        nodeList.nodes.forEach(function (node) {
          node.destroy();
        });

        delete nodeList.nodes;
      }
    }
  };

  mixinInit(nodeList, init);

  decorators.nodeList.init(nodeList);

  return nodeList;
};

module.exports = function (init, decorators) {
  decorators = decorators || [];
  var composedDecorators = {
    root: {
      init: composeDecorators(decorators, 'root', 'init'),
      createList: composeDecorators(decorators, 'root', 'createList'),
      moveNode: composeDecorators(decorators, 'root', 'moveNode'),
      destroy: composeDecorators(decorators, 'root', 'destroy')
    },
    node: {
      init: composeDecorators(decorators, 'node', 'init'),
      createList: composeDecorators(decorators, 'node', 'createList'),
      destroy: composeDecorators(decorators, 'node', 'destroy')
    },
    nodeList: {
      init: composeDecorators(decorators, 'nodeList', 'init'),
      addNode: composeDecorators(decorators, 'nodeList', 'addNode'),
      removeNode: composeDecorators(decorators, 'nodeList', 'removeNode'),
      destroy: composeDecorators(decorators, 'nodeList', 'destroy')
    }
  };

  var root = {
    createList: function (init) {
      root.childList = nodeListFacade(init, root, root, composedDecorators);

      composedDecorators.root.createList(root.childList);

      return root.childList;
    },
    destroy: function () {
      if (!root.isDestroyed) {
        root.isDestroyed = true;
        if (root.childList) {
          root.childList.destroy();
          delete root.childList;
        }
        composedDecorators.root.destroy(root);
      }
    },
    moveNode: function (node, nodeList, index) {
      var oldNodeList = node.parentList;
      var oldIndex = node.index;

      oldNodeList.nodes.splice(oldIndex, 1);
      for (var i = oldIndex; i < oldNodeList.length; i++) {
        oldNodeList[i].index--;
      }

      node.parentList = nodeList;
      node.index = index;
      nodeList.nodes.splice(index, 0, node);
      for (i = index; i < nodeList.length; i++) {
        nodeList[i].index++;
      }
      composedDecorators.root.moveNode([node, oldNodeList, oldIndex, nodeList, index]);
    },
    addDecorator: function (decorator) {
      if (addDecorator(decorators, decorator, 'root', 'init')) {
        decorator.root.init(root);
      }
      if (addDecorator(decorators, decorator, 'root', 'createList') && root.childList) {
        decorator.root.createList(root.childList);
      }
      addDecorator(decorators, decorator, 'root', 'moveNode');
      addDecorator(decorators, decorator, 'root', 'destroy');

      addDecorator(decorators, decorator, 'node', 'init');
      addDecorator(decorators, decorator, 'node', 'createList');
      addDecorator(decorators, decorator, 'node', 'destroy');

      addDecorator(decorators, decorator, 'nodeList', 'init');
      addDecorator(decorators, decorator, 'nodeList', 'addNode');
      addDecorator(decorators, decorator, 'nodeList', 'removeNode');
      addDecorator(decorators, decorator, 'nodeList', 'destroy');

      if (root.childList && (decorator.node || decorator.nodeList)) {
        addDecoratorToNodeList(decorator, root.childList);
      }
    }
  };

  mixinInit(root, init);

  composedDecorators.root.init(root);

  return root;
};