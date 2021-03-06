module.exports = function(utils, adapter) {
  var Presenter;
  Presenter = (function() {
    var buildLinks;

    buildLinks = function(link) {
      if (link == null) {
        return;
      }
      if ((link.self != null) || (link.related != null)) {
        return link;
      } else {
        return {
          self: link
        };
      }
    };

    Presenter.adapter = adapter;

    Presenter.prototype.type = 'objects';

    function Presenter(scope) {
      if (scope == null) {
        scope = {};
      }
      this.scope = scope;
    }

    Presenter.prototype.id = function(instance) {
      return this.constructor.adapter.id(instance);
    };

    Presenter.prototype.selfLinks = function(instance) {};

    Presenter.prototype.links = function() {};

    Presenter.prototype.relationships = function() {};

    Presenter.prototype.attributes = function(instance) {
      var attributes, key, relationships;
      if (instance == null) {
        return null;
      }
      attributes = utils.clone(this.constructor.adapter.get(instance));
      delete attributes['id'];
      delete attributes['type'];
      relationships = this.relationships();
      for (key in relationships) {
        delete attributes[key];
      }
      return attributes;
    };

    Presenter.prototype.includeRelationships = function(scope, instance) {
      var data, factory, key, presenter, relationships, results;
      relationships = this.relationships();
      results = [];
      for (key in relationships) {
        factory = relationships[key] || (function() {
          throw new Error("Presenter for " + key + " in " + this.type + " is not defined");
        }).call(this);
        presenter = new factory(scope);
        data = this.constructor.adapter.get(instance, key);
        if (data != null) {
          results.push(presenter.toJSON(data, {
            include: true
          }));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    Presenter.prototype.buildRelationships = function(instance) {
      var build, buildData, data, key, links, presenter, relationships, rels;
      if (instance == null) {
        return null;
      }
      rels = this.relationships();
      links = this.links(instance) || {};
      relationships = null;
      for (key in rels) {
        data = this.constructor.adapter.get(instance, key);
        presenter = rels[key];
        buildData = (function(_this) {
          return function(d) {
            return data = {
              id: _this.constructor.adapter.id(d),
              type: presenter.prototype.type
            };
          };
        })(this);
        build = (function(_this) {
          return function(d) {
            var rel;
            rel = {};
            if (d != null) {
              rel.data = buildData(d);
            }
            if (links[key] != null) {
              rel.links = buildLinks(links[key]);
            }
            return rel;
          };
        })(this);
        relationships || (relationships = {});
        relationships[key] || (relationships[key] = {});
        if (data instanceof Array) {
          relationships[key].data = data.map(buildData);
          if (links[key] != null) {
            relationships[key].links = buildLinks(links[key]);
          }
        } else {
          relationships[key] = build(data);
        }
      }
      return relationships;
    };

    Presenter.prototype.buildSelfLink = function(instance) {
      return buildLinks(this.selfLinks(instance));
    };

    Presenter.prototype.toJSON = function(instanceOrCollection, options) {
      var added, base, base1, base2, collection, instance, links, model, relationships;
      if (options == null) {
        options = {};
      }
      if (options.meta != null) {
        this.scope.meta = options.meta;
      }
      (base = this.scope).data || (base.data = null);
      if (instanceOrCollection == null) {
        return this.scope;
      }
      if (instanceOrCollection instanceof Array) {
        collection = instanceOrCollection;
        (base1 = this.scope).data || (base1.data = []);
        collection.forEach((function(_this) {
          return function(instance) {
            return _this.toJSON(instance, options);
          };
        })(this));
      } else {
        instance = instanceOrCollection;
        added = true;
        model = {
          id: this.id(instance),
          type: this.type,
          attributes: this.attributes(instance)
        };
        relationships = this.buildRelationships(instance);
        if (relationships != null) {
          model.relationships = relationships;
        }
        links = this.buildSelfLink(instance);
        if (links != null) {
          model.links = links;
        }
        if (options.include) {
          (base2 = this.scope).included || (base2.included = []);
          if (!utils.any(this.scope.included.concat(this.scope.data), function(i) {
            return i.id === model.id && i.type === model.type;
          })) {
            this.scope.included.push(model);
          } else {
            added = false;
          }
        } else if (this.scope.data != null) {
          if (!(this.scope.data instanceof Array && utils.any(this.scope.data, function(i) {
            return i.id === model.id;
          }))) {
            this.scope.data.push(model);
          } else {
            added = false;
          }
        } else {
          this.scope.data = model;
        }
        if (added) {
          this.includeRelationships(this.scope, instance);
        }
      }
      return this.scope;
    };

    Presenter.prototype.render = function(instanceOrCollection, options) {
      if (utils.isPromise(instanceOrCollection)) {
        return instanceOrCollection.then((function(_this) {
          return function(data) {
            return _this.toJSON(data, options);
          };
        })(this));
      } else {
        return this.toJSON(instanceOrCollection, options);
      }
    };

    Presenter.toJSON = function() {
      var ref;
      return (ref = new this).toJSON.apply(ref, arguments);
    };

    Presenter.render = function() {
      var ref;
      return (ref = new this).render.apply(ref, arguments);
    };

    return Presenter;

  })();
  return module.exports = Presenter;
};
