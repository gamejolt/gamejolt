angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'fireside.tags.view', {
		url: '/tag/:tag',
		controller: 'Fireside.Tags.ViewCtrl',
		controllerAs: 'viewCtrl',
		templateUrl: '/app/views/fireside/tags/view/view.html',
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/fireside/tags/' + $stateParams.tag );
			}
		}
	} );
} );
