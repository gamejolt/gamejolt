angular
	.module('App.Client.Hidpi', [])
	.run(function(Environment, $window, $log) {
		if (GJ_IS_CLIENT) {
			var os = require('os');
			var platform = os.platform();

			if (platform == 'linux') {
				if ($window.devicePixelRatio > 1 || $window.screen.width > 2600) {
					var gui = require('nw.gui');
					var win = gui.Window.get();

					$log.info('Detected HiDPI screen. Changing zoom level.');
					win.zoomLevel = 4;
				}
			}
		}
	});
