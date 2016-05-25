angular.module( 'App.Secure', [] ).run( function( $rootScope, $window, $state, $location, $log, Environment )
{
	// Don't want to be changing protocols on client.
	if ( Environment.isClient ) {
		return;
	}

	$rootScope.$on( '$stateChangeStart', function( event, toState, toParams )
	{
		var redirectUrl = null;
		if ( toState && toState.data && toState.data.secure ) {
			if ( $location.protocol() != 'https' ) {
				redirectUrl = Environment.wttfBaseUrlSecure + $state.href( toState, toParams );
			}
		}
		else if ( $location.protocol() == 'https' ) {
			redirectUrl = Environment.wttfBaseUrl + $state.href( toState, toParams );
		}

		if ( redirectUrl ) {
			if ( Environment.env == 'production' ) {
				$log.info( 'Toggle secure url.', redirectUrl );
				// $window.location = redirectUrl;
			}
			else {
				$log.info( 'Skip secure toggle because development.', redirectUrl );
			}
		}
	} );
} );