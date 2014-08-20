'use strict';

module.exports.isAncestor = function (possibleAncestor, node) {
  while (node) {
    if (node === possibleAncestor) {
      return true;
    }
    node = node.parent;
  }
  return false;
};