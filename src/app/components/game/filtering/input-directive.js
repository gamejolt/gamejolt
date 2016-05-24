angular.module( 'App.Game.Filtering' ).directive( 'gjGameFilteringInput', function()
{
	return {
		scope: {
			filteringContainer: '=gjFilteringContainer',
		},
		templateUrl: '/app/components/game/filtering/input.html',
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope, $element, hotkeys, Analytics )
		{
			this.query = this.filteringContainer.filters.query;

			this.clear = function()
			{
				this.query = '';
				this.filteringContainer.unsetFilter( 'query' );
				this.filteringContainer.onChanged();

				Analytics.trackEvent( 'game-filtering', 'query-clear' );
			};

			this.onQueryChanged = function()
			{
				this.filteringContainer.setFilter( 'query', this.query );
				this.filteringContainer.onChanged();

				if ( this.query ) {
					Analytics.trackEvent( 'game-filtering', 'query-change', this.query );
				}
				else {
					Analytics.trackEvent( 'game-filtering',' query-change-empty' );
				}
			};

			var inputElem = $element.find( 'input' )[0];

			this.blur = function( $event )
			{
				$event.stopPropagation();  // Don't propagate the "escape" since we caught it.
				$event.preventDefault();  // Was clearing out the input by default.
				inputElem.blur();
			};

			hotkeys.bindTo( $scope )
				.add( {
					combo: 'f',
					description: 'Focus the filter input on the current page.',
					callback: function( $event )
					{
						inputElem.focus();

						// Prevent it from adding an "f" in the input box.
						$event.preventDefault();
					}
				} );
		}
	};
} );
