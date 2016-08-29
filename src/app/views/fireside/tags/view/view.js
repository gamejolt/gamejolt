angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'tags.view', {
		url: '/tag/:tag',
		controller: 'Tags.ViewCtrl',
		controllerAs: 'viewCtrl',
		templateUrl: '/app/views/tags/view/view.html',
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/fireside/tags/' + $stateParams.tag );
			}
		}
	} );
} );