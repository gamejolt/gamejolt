// Just include the client modules we want for other sections as well.
angular.module('App.ClientBase', [
	'App.Client.Control',
	'App.Client.Tray',
	'App.Client.ExternalLink',
	'App.Client.Hidpi',
	'App.Client.Info',
	'App.Client.HistoryNavigator',
]);
