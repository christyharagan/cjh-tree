'use strict';

module.exports.spec = function (name) {
  return {
    name: name,
    methods: {
      getLength: {},
      getChild: {},
      getParent: {},
      getIndex: {},
      getRoot: {},

      getProperty: {},

      addChild: {},
      removeChild: {},

      move: {},

      destroy: {}
    },
    events: {
      destroyed: {},
      added: {},
      removed: {},
      moved: {}
    }
  };
};
