angular.module( 'App.Views' ).controller( 'SearchCtrl', function( $state, $scope, $document, Search )
{
	$scope.Search = Search;

	// We store our own version of the search query and sync back to it on form submission.
	this.query = Search.query;

	this.showPagination = false;
	this.noResults = false;
	this.payload = undefined;

	this.onSearchSubmitted = function()
	{
		Search.query = this.query;
		$state.go( 'search.results', { q: Search.query } );
	};

	this.onSearchBlurred = function()
	{
		// Somewhat fragile, but basically the autocompleter may be transitioning them.
		// If we aren't transitioning then submit the search.
		if ( !$state.transition ) {
			this.onSearchSubmitted();
		}
	};
} );
