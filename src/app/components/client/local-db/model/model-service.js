angular
	.module('App.Client.LocalDb')
	.service('LocalDb_Model', function($q, LocalDb, Model) {
		var db = LocalDb.getDb();

		this.create = function(model) {
			if (!model._table) {
				throw new Error('Must have `collection` set on model.');
			}

			var _table = db[model._table];

			model.populate = function(rows) {
				var models = [];
				if (rows && angular.isArray(rows) && rows.length) {
					for (var i = 0; i < rows.length; ++i) {
						models.push(new model(rows[i]));
					}
				}
				return models;
			};

			model.prototype.assign = function(other) {
				// Some times the model constructors add new fields when populating.
				// This way we retain those fields.
				var newObj = new model(other);
				angular.extend(this, newObj);
			};

			model.table = function() {
				return _table;
			};

			model.fetch = function(id) {
				var promise;

				if (!id) {
					promise = _table.toArray().then(function(instances) {
						return model.populate(instances);
					});
				} else {
					promise = _table.get(id).then(function(instance) {
						if (!instance) {
							return null;
						}
						return new model(instance);
					});
				}

				return $q.when(promise);
			};

			model.prototype.$save = function() {
				// Omit any fields beginning with _ or $.
				// They are reseerved for dynamic fields that we don't want stored.
				var skip = /^(_|\$)/;
				var data = _.omit(this, function(val, key) {
					// We also skip functions.
					return skip.test(key) || angular.isFunction(val);
				});

				return $q.when(_table.put(data));
			};

			model.prototype.$remove = function() {
				return $q.when(_table.delete(this.id));
			};

			return model;
		};
	});
