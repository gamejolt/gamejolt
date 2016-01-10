// Just include the client modules we want for auth as well.
angular.module( 'App.ClientAuth', [
	'gj.Device',
	'App.Client.Control',
	'App.Client.Tray',
	'App.Client.ExternalLink',
] );
