angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.devlog.list', {
		url: '?page',
		controller: 'Dashboard.Developer.Games.Manage.Devlog.ListCtrl',
		controllerAs: 'listCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/devlog/list/list.html',
		resolve: {
			payload: function( Api, $stateParams )
			{
				var query = [];
				if ( $stateParams.page ) {
					query.push( 'page=' + $stateParams.page );
				}

				return Api.sendRequest( '/web/dash/developer/games/devlog/' + $stateParams.id + '?' + query.join( '&' ) );
			}
		}
	} );
} );
