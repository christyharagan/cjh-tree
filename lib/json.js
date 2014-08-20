'use strict';

var _ = require('underscore');
var Tree = require('./tree');

module.exports.toJSON = function (facade, toJSONs) {
  var json = {};

  _.each(facade, function (value, property) {
    switch (property) {
      case 'children':
        json.children = value.map(function (child) {
          module.exports.toJSON(child, toJSONs);
        });
        break;
      default:
        if (toJSONs) {
          var toJSON = toJSONs[property];
          if (toJSON) {
            json[property] = toJSON(value);
          }
        }
        break;
    }
  });

  return json;
};

module.exports.fromJSON = function (json, decorators, fromJSONs, beforeChildren, afterChildren) {
  var root = Tree({}, decorators);

  _fromJSON(json, root, fromJSONs, beforeChildren, afterChildren);

  return root;
};

var _fromJSON = function (json, facade, fromJSONs, beforeChildren, afterChildren) {
  if (beforeChildren) {
    _.each(json, function (value, property) {
      switch (property) {
        case 'children':
          break;
        default:
          var fromJSON = beforeChildren[property];
          if (fromJSON) {
            facade[property] = fromJSON(value, facade);
          }
          break;
      }
    });
  }

  _.each(json, function (value, property) {
    switch (property) {
      case 'children':
        var node = facade.addNode({});
        _fromJSON(value, node, fromJSONs, beforeChildren, afterChildren);
        break;
      default:
        if (fromJSONs) {
          var fromJSON = fromJSONs[property];
          if (fromJSON) {
            facade[property] = fromJSON(value, facade);
          }
        }
        break;
    }
  });

  if (afterChildren) {
    _.each(json, function (value, property) {
      switch (property) {
        case 'children':
          break;
        default:
          var fromJSON = afterChildren[property];
          if (fromJSON) {
            facade[property] = fromJSON(value, facade);
          }
          break;
      }
    });
  }
};
