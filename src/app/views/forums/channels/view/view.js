angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'forums.channels.view', {
		url: '/f/:name',
		controller: 'Forums.Channels.ViewCtrl',
		controllerAs: 'viewCtrl',
		templateUrl: '/app/views/forums/channels/view/view.html',
		resolve: {
			payload: function( $stateParams, Api )
			{
				return Api.sendRequest( '/web/forums/channels/' + $stateParams.name );
			}
		}
	} );
} );
