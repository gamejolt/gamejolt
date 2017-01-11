angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.site', {
		url: '/site',
		controller: 'Dashboard.Developer.Games.Manage.SiteCtrl',
		controllerAs: 'siteCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/site/site.html',
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/dash/sites/' + $stateParams.id );
			},
		}
	} );
} );
