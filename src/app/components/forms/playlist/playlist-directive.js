angular.module( 'App.Forms' ).directive( 'gjFormPlaylist', function( Form )
{
	var form = new Form( {
		model: 'GamePlaylist',
		template: require( './playlist.html' )
	} );

	form.onInit = function( scope )
	{

	};

	return form;
} );
