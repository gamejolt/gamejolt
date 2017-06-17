angular.module('App.Client.Control').service('Client', function($log) {
	var _this = this;

	var gui = require('nw.gui');
	var app = gui.App;
	var win = gui.Window.get();

	// Whether or not we started "hidden".
	this.startedSilently = false;

	// If they try to open the app again we should get a second 'open' event.
	// We should force it into view.
	app.on('open', function(cmdLine) {
		$log.info('They tried opening the Client again. Force showing the window.');
		_this.show();
	});

	/**
	 * A soft close. It won't quit the whole app.
	 */
	this.close = function() {
		win.close();
	};

	/**
	 * Can be used to bring the window back up when it's closed.
	 */
	this.show = function() {
		win.show();
		win.focus();
		win.restore();
	};

	/**
	 * Quits the whole app.
	 */
	this.quit = function() {
		// Passing in true does a force quit of the application.
		win.close(true);
	};

	this.setProgressBar = function(progress) {
		win.setProgressBar(progress);
	};

	this.clearProgressBar = function(progress) {
		win.setProgressBar(-1);
	};

	if (app.argv.length) {
		for (var i = 0; i < app.argv.length; ++i) {
			if (app.argv[i] == '--silent-start') {
				$log.info('Started silently.');
				this.startedSilently = true;
				break;
			}
		}
	}

	if (!this.startedSilently) {
		$log.info('Started explicitly. Force showing the window.');
		_this.show();
	}
});
