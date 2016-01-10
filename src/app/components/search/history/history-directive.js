angular.module( 'App.Search' ).directive( 'gjSearchHistory', function( Popover )
{
	return {
		restrict: 'E',
		require: '^gjSearch',
		templateUrl: '/app/components/search/history/history.html',
		scope: {},
		controllerAs: 'ctrl',
		controller: function( $timeout, $state, Search_History )
		{
			this.isVisible = false;

			this.refresh = function()
			{
				this.recentSearches = Search_History.get();
			};

			this.onShow = function()
			{
				this.isVisible = true;
				this.refresh();

				// Give us time to render ourselves before showing.
				return $timeout( angular.noop );
			};

			this.onHide = function()
			{
				this.isVisible = false;
			};

			this.go = function( query )
			{
				$state.go( 'search.results', { q: query } );
				Popover.hideAll();
			};

			this.clear = function()
			{
				Search_History.clear();
				Popover.hideAll();
			};
		}
	};
} );
