angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'styleguide', {
		url: '/styleguide',
		controller: function( App )
		{
			App.title = 'Styleguide';
		},
		templateUrl: '/app/views/styleguide/styleguide.html',
		resolve: {
			init: function( Translate )
			{
				return Translate.loadSection( 'main' );
			},
			payload: function( User )
			{
				return User.touch();
			}
		},
	} );
} );
