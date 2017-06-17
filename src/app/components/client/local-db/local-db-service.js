angular.module('App.Client.LocalDb').provider('LocalDb', function() {
	var provider = this;

	var VERSION = 1;

	this.tableDefinitions = {};
	this.tableUpgrades = {};

	this.registerTable = function(version, table, definition, upgrader) {
		if (!this.tableDefinitions[version]) {
			this.tableDefinitions[version] = {};
		}

		this.tableDefinitions[version][table] = definition;

		if (!this.tableUpgrades[version]) {
			this.tableUpgrades[version] = [];
		}

		if (upgrader) {
			this.tableUpgrades[version].push(upgrader);
		}
	};

	this.$get = function($window, $q) {
		function LocalDb() {
			var db = new Dexie('local');

			Dexie.Promise.on('error', function(err) {
				console.error(err);
			});

			// Allows us to change between versions of the DB with upgrade funcs.
			for (var i = 1; i <= VERSION; ++i) {
				if (!provider.tableDefinitions[i]) {
					continue;
				}

				var version = db.version(i).stores(provider.tableDefinitions[i]);
				if (provider.tableUpgrades[i].length) {
					version.upgrade(function(trans) {
						for (var n in provider.tableUpgrades[i]) {
							provider.tableUpgrades[i][n](trans);
						}
					});
				}
			}

			db.open();

			this.getDb = function() {
				return db;
			};

			this.transaction = function(mode, models, fn) {
				var tables = _.map(models, function(model) {
					return model._table;
				});

				return $q.when(db.transaction(mode, tables, fn));
			};
		}

		return new LocalDb();
	};
});
