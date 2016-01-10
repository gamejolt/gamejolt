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
			payload: function( User )
			{
				return User.touch();
			}
		},
	} );
} );
