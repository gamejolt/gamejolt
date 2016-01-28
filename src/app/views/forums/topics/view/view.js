angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'forums.topics.view', {
		url: '/f/:slug/:id',
		controller: 'Forums.Topics.ViewCtrl',
		controllerAs: 'viewCtrl',
		templateUrl: '/app/views/forums/topics/view/view.html',
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/forums/topics/' + $stateParams.id );
			}
		}
	} );
} );
