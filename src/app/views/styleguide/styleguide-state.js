angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'styleguide', {
		url: '/styleguide',
		controller: function( $scope, App )
		{
			App.title = 'Styleguide';

			$scope.templates = [
				require( '../../../lib/gj-lib-client/components/button/button-styleguide.html' ),
				require( '../../../lib/gj-lib-client/components/list-group/list-group-styleguide.html' ),
				require( '../../../lib/gj-lib-client/components/progress/bar/bar-styleguide.html' ),
				require( '../../../lib/gj-lib-client/components/jolticons/jolticons-styleguide.html' ),
			];
		},
		templateUrl: require( './styleguide.html' ),
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
