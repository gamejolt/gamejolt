angular.module( 'App.Client', [
	'gj.Connection.StatePermissions',

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
	'App.Client.PackageCardOptions',
	'App.Client.Logger',
	'App.Client.SystemReportModal',
	'App.Client.Info',
] )
.config( function( $httpProvider )
{
	// Modify all HTTP requests to include the client version.
	$httpProvider.interceptors.push( function( $injector )
	{
		return {
			request: function( config )
			{
				var headers = {
					'x-gj-client-version': $injector.get( 'Client_Info' ).getVersion(),
				};

				config.headers = config.headers || {};
				angular.extend( config.headers, headers );

				return config;
			},
		};
	} );

} );
