angular.module( 'App.Client.ExternalLink', [] ).run( function( $window, Environment )
{
	var gameJoltRegex = /^(http|https):\/\/gamejolt.com/;

	var relativeBlacklist = [
		/^\/gas(\/.*)?$/,
		/^\/api\//,
		/^\/community\/forums/,
		/^\/developers\//,
		/^\/claim(\/.*)?$/,
		/^\/moderate\//,
		/^\/feeds\//,
		/^\/community\/contests\//
	];

	var gui = require( 'nw.gui' );

	// Attach a click handler on the whole window so we can track all clicks.
	$window.addEventListener( 'click', function( event )
	{
		handleLink( event, event.target );
	} );

	function handleLink( event, element, isParent )
	{
		isParent = isParent || false;

		// Check this element's parent if it's not an A tag that was clicked.
		if ( element.nodeName.toLowerCase() != 'a' || !element.hasAttribute( 'href' ) ) {
			if ( !isParent ) {
				handleLink( event, element.parentElement, true );
			}
			return;
		}

		var link = element.getAttribute( 'href' );
		var isGameJoltLink = false;

		if ( gameJoltRegex.test( link ) ) {
			link = link.replace( gameJoltRegex, '' );
			isGameJoltLink = true;
		}

		// Check for paths that can't be opened in client.
		// We will have to open them externally.
		for ( var i in relativeBlacklist ) {
			var regex = relativeBlacklist[ i ];
			if ( regex.test( link ) ) {
				gui.Shell.openExternal( Environment.baseUrl + link );
				event.preventDefault();
				return;
			}
		}

		// It's a Game Jolt link, but it's not blacklisted, we can open this in the client
		if ( isGameJoltLink || link[0] == '/' ) {
			$window.location = Environment.wttfBaseUrl + link;
			event.preventDefault();
		}
		// Do nothing if it's a local relative or absolute link
		else if ( link.startsWith( '#!' ) || link.startsWith( 'app://' ) ) {
		}
		else {
			gui.Shell.openExternal ( link );
			event.preventDefault();
		}
	}
} );
