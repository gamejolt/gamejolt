angular.module( 'App.Views' ).controller( 'Search.ResultsCtrl', function( $scope, $stateParams, Translate, App, Search, Search_History, payload )
{
	var searchCtrl = $scope.searchCtrl;

	searchCtrl.query = '';
	searchCtrl.showPagination = false;
	searchCtrl.payload = {};
	searchCtrl.noResults = false;

	if ( !$stateParams.q ) {
		App.title = Translate.pageTitle( 'search.page_title' );
		return;
	}

	App.title = Translate.pageTitle( 'search.results.page_title', { query: $stateParams.q } );

	searchCtrl.query = $stateParams.q;

	// We sync the query to the search service so that all places get updated with the new query.
	// We also record the search history since it was an explicit search request.
	Search.query = searchCtrl.query;
	Search_History.record( searchCtrl.query );

	searchCtrl.payload = payload;
	searchCtrl.showPagination = searchCtrl.payload.type != 'all';

	if ( !payload.gamesCount && !payload.usersCount ) {
		searchCtrl.noResults = true;
	}
} );
