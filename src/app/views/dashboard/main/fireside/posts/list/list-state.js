angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.main.fireside.posts.list', {
		url: '',
		controller: 'Dashboard.Main.Fireside.Posts.ListCtrl',
		controllerAs: 'listCtrl',
		templateUrl: '/app/views/dashboard/main/fireside/posts/list/list.html',
		resolve: {
			payload: function( Api )
			{
				return Api.sendRequest( '/fireside/dash/posts' );
			}
		}
	} );
} );
