angular.module( 'App.Forms' ).directive( 'gjFormPlaylist', function( Form )
{
	var form = new Form( {
		model: 'GamePlaylist',
		template: '/app/components/forms/playlist/playlist.html'
	} );

	form.onInit = function( scope )
	{

	};

	return form;
} );
