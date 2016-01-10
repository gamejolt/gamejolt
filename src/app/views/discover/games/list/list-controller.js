angular.module( 'App.Views' ).controller( 'Discover.Games.ListCtrl', function( $state, AutoScroll, filteringContainer )
{
	var _this = this;

	this.filteringContainer = filteringContainer;
	this.gamesCount = 0;
	this.perPage = 10;
	this.currentPage = 1;

	this.onFiltersChanged = function()
	{
		AutoScroll.noScroll( true );

		var params = this.filteringContainer.getStateParams();
		params.page = undefined;  // Reset to first page.

		$state.go( $state.current, params, { location: 'replace' } );
	};

	this.getSectionUrl = function( section )
	{
		var state = 'discover.games.list.section';
		if ( this.category ) {
			state += '-category';
		}

		return $state.href( state, { section: section, category: this.category || undefined, page: undefined } )
	};
} );
