angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'discover.news', {
		abstract: true,
		controller: 'Discover.NewsCtrl',
		controllerAs: 'newsCtrl',
		templateUrl: '/app/views/discover/news/news.html'
	} );
} );
