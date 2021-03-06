var Adapter, Q, _, adapters, lookupAdapter, presenter, presenterFactory, utils;

this.window || (this.window = {});

Q = this.window.Q;

_ = this.window._;

Q || (Q = ((function() {
  try {
    return typeof require === "function" ? require('q') : void 0;
  } catch (error) {}
})()));

_ || (_ = ((function() {
  try {
    return typeof require === "function" ? require('lodash/dist/lodash.underscore') : void 0;
  } catch (error) {}
})()));

_ || (_ = ((function() {
  try {
    return typeof require === "function" ? require('underscore') : void 0;
  } catch (error) {}
})()));

utils = require('./yayson/utils')(_, Q);

Adapter = require('./yayson/adapter');

adapters = require('./yayson/adapters');

presenterFactory = require('./yayson/presenter');

lookupAdapter = function(nameOrAdapter) {
  return adapters[nameOrAdapter] || Adapter;
};

presenter = function(options) {
  var adapter;
  if (options == null) {
    options = {};
  }
  adapter = lookupAdapter(options.adapter);
  return presenterFactory(utils, adapter);
};

module.exports = function(arg) {
  var adapter;
  adapter = (arg != null ? arg : {}).adapter;
  return {
    Store: require('./yayson/store')(utils),
    Presenter: presenter({
      adapter: adapter
    }),
    Adapter: Adapter
  };
};
