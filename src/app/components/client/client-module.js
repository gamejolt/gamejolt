angular
	.module('App.Client', [
		'App.Client.Control',
		'App.Client.Shortcut',
		'App.Client.Autostart',
		'App.Client.Intro',
		'App.Client.User',
		'App.Client.LocalDb',
		'App.Client.Tray',
		'App.Client.MacAppMenu',
		'App.Client.Forms',
		'App.Client.Hidpi',
		'App.Client.Library',
		'App.Client.Installer',
		'App.Client.Launcher',
		'App.Client.HideOffline',
		'App.Client.ExternalLink',
		'App.Client.StatusBar',
		'App.Client.InstallProgress',
		'App.Client.GameButtons',
		'App.Client.InstallPackageModal',
		'App.Client.PackageCardButtons',
		'App.Client.Logger',
		'App.Client.SystemReportModal',
		'App.Client.Info',
		'App.Client.HistoryNavigator',
	])
	.config(function($httpProvider) {
		// Modify all HTTP requests to include the client version.
		$httpProvider.interceptors.push(function($injector) {
			return {
				request: function(config) {
					var headers = {
						'x-gj-client-version': $injector.get('Client_Info').getVersion(),
					};

					config.headers = config.headers || {};
					angular.extend(config.headers, headers);

					return config;
				},
			};
		});
	});

require('./autostart/autostart-module');
require('./control/control-module');
require('./external-link/external-link-module');
require('./forms/form-module');
require('./game-buttons/game-buttons-module');
require('./hide-offline/hide-offline-module');
require('./hidpi/hidpi-module');
require('./history-navigator/history-navigator-module');
require('./info/info-module');
require('./install-package-modal/install-package-modal-module');
require('./install-progress/install-progress-module');
require('./installer/installer-module');
require('./intro/intro-module');
require('./launcher/launcher-module');
require('./library/library-module');
require('./local-db/local-db-module');
require('./logger/logger-module');
require('./mac-app-menu/mac-app-menu-module');
require('./package-card-buttons/package-card-buttons-module');
require('./shortcut/shortcut-module');
require('./status-bar/status-bar-module');
require('./system-report-modal/system-report-modal-module');
require('./tray/tray-module');
require('./user/user-module');
