angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.main.fireside.posts.edit', {
		url: '/posts/edit/:postId',
		controller: 'Dashboard.Main.Fireside.Posts.EditCtrl',
		controllerAs: 'editCtrl',
		templateUrl: '/app/views/dashboard/main/fireside/posts/edit/edit.html',
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/fireside/dash/posts/' + $stateParams.postId );
			}
		}
	} );
} );
