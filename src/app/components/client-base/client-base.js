// Just include the client modules we want for other sections as well.
angular.module( 'App.ClientBase', [
	'gj.Device',
	'App.Client.Control',
	'App.Client.Tray',
	'App.Client.ExternalLink',
	'App.Client.Info',
	'App.Client.HistoryNavigator',
] );
