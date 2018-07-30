module.exports = {
	run: function(indexedDB, localStorage, nwGui) {
		setTimeout(function() {
			console.log('migration is taking too long. aborting');
			nwGui.App.quit();
		}, 5000);

		var fs = require('fs');
		var path = require('path');

		var migrationFile = path.join(nwGui.App.dataPath, '0.12.3-migration.json');
		if (fs.existsSync(migrationFile)) {
			fs.unlinkSync(migrationFile);
		}

		var conn = indexedDB.open('local', 20);

		conn.onerror = function(event) {
			console.log('error opening indexeddb');
			console.log(event);
			nwGui.App.quit();
		};

		conn.onblocked = function(event) {
			console.log('blocked from opening indexeddb');
			console.log(event);
			nwGui.App.quit();
		};

		conn.onupgradeneeded = function() {
			console.log('Defining schema');
			var db = conn.result;

			db.createObjectStore('games', { keyPath: 'id' });
			db.createObjectStore('packages', { keyPath: 'id' }).createIndex('game_id', 'game_id');
		};

		conn.onsuccess = function() {
			console.log('Db opened');
			var db = conn.result;

			var gotGames = false;
			var gamesData = null;
			var gotPackages = false;
			var packagesData = null;
			var hasError = false;

			var checkDone = function() {
				if (gotGames && gotPackages) {
					if (hasError) {
						console.log("Can't save migration data because we encountered an error");
						nwGui.App.quit();
						return;
					}

					fs.writeFileSync(
						migrationFile,
						JSON.stringify({
							indexeddb: {
								games: gamesData,
								packages: packagesData,
							},
							localStorage: localStorage,
						}),
						{ encoding: 'utf8' }
					);

					nwGui.App.quit();
				}
			};

			var getAll = function(store, cb) {
				var req = store.openCursor();

				var fired = false;
				var data = [];

				req.onerror = function(event) {
					if (fired) {
						return;
					}
					fired = true;

					cb(event.error, null);
				};

				req.onsuccess = function(event) {
					if (fired) {
						return;
					}

					cursor = event.target.result;
					if (cursor) {
						data.push(cursor.value);
						cursor.continue();
					} else {
						fired = true;
						cb(null, data);
					}
				};
			};

			console.log(db);
			var games = db.transaction('games', 'readonly').objectStore('games');
			getAll(games, function(err, data) {
				if (err) {
					console.log('error getting games');
					console.log(err);
					hasError = true;
				} else {
					console.log('success getting games');
					console.log(data);
					gamesData = data;
				}

				gotGames = true;
				checkDone();
			});

			var packages = db.transaction('packages', 'readonly').objectStore('packages');
			getAll(packages, function(err, data) {
				if (err) {
					console.log('error getting packages');
					console.log(err);
					hasError = true;
				} else {
					console.log('success getting packages');
					console.log(data);
					packagesData = data;
				}

				gotPackages = true;
				checkDone();
			});
		};
	},
};
