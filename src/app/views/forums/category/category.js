angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'forums.category', {
		url: '/forums/category/:url',
		controller: 'Forums.CategoryCtrl',
		controllerAs: 'categoryCtrl',
		templateUrl: '/app/views/forums/category/category.html',
		resolve: {
			payload: function( $stateParams, Api )
			{
				return Api.sendRequest( '/web/forums/categories/' + $stateParams.url );
			}
		}
	} );
} );
