angular.module( 'App.ProtocolWatcher' ).provider( 'ProtocolWatcher', function()
{
	var provider = this;
	var _secureSections = [];

	provider.registerSecure = function( sectionPrefix )
	{
		_secureSections.push( sectionPrefix );
	};

	this.$get = function( $rootScope, $window, $state, Environment )
	{
		var ProtocolWatcher = {};
		ProtocolWatcher.registerSecure = provider.registerSecure;

		function switchProtocol( protocol, state, stateParams, event )
		{
			var toUrl = protocol + '://' + $window.location.host + $state.href( state, stateParams );
			if ( Environment.env == 'production' ) {
				event.preventDefault();
				$window.location = toUrl;
			}
			else {
				console.log( 'Switch Protocol: ' + toUrl );
			}
		}

		ProtocolWatcher.init = function()
		{
			// We never switch protocols on Client.
			if ( Environment.isClient ) {
				return;
			}

			$rootScope.$on( '$stateChangeStart', function( event, to, toParams )
			{
				// If not secure but we are moving to a secure location.
				if ( !Environment.isSecure ) {
					for ( var i = 0; i < _secureSections.length; ++i ) {
						if ( to.name.indexOf( _secureSections[i] ) === 0 ) {
							switchProtocol( 'https', to, toParams, event );
							break;
						}
					}
				}
				// Redirect away from secure if not moving to a secure location.
				else if ( Environment.isSecure ) {
					var found = false;
					for ( var i = 0; i < _secureSections.length; ++i ) {
						if ( to.name.indexOf( _secureSections[i] ) === 0 ) {
							found = true;
							break;
						}
					}

					if ( !found ) {
						switchProtocol( 'http', to, toParams, event );
					}
				}
			} );
		};

		return ProtocolWatcher;
	};
} )
.run( function( ProtocolWatcher )
{
	ProtocolWatcher.init();
} );
