angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'forums.channels.view.page', {
		url: '/f/:name?page',
		controller: 'Forums.Channels.View.PageCtrl',
		resolve: {
			payload: function( $stateParams, Api )
			{
				return Api.sendRequest( '/web/forums/channels/' + $stateParams.name + '?page=' + ($stateParams.page || 1) );
			}
		}
	} );
} );
