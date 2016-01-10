angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage', {
		abstract: true,
		url: '/:id',
		controller: 'Dashboard.Developer.Games.ManageCtrl',
		controllerAs: 'manageCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/manage.html',
		resolve: {
			managePayload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/dash/developer/games/' + $stateParams.id );
			},
		}
	} );
} );
