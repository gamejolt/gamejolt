angular.module( 'App.Game.Filtering' ).directive( 'gjGameFilteringWidget', function( Game_Filtering_Container )
{
	return {
		scope: {
			filteringContainer: '=gjFilteringContainer',
		},
		templateUrl: '/app/components/game/filtering/widget.html',
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope, Analytics )
		{
			$scope.Game_Filtering_Container = Game_Filtering_Container;

			this.visiblePopovers = {};

			this.orderedFilters = {
				price: [ 'free', 'paid', '5-less', '15-less', '30-less' ],
				os: [ 'windows', 'mac', 'linux', 'other', 'rom' ],
				browser: [ 'html', 'flash', 'unity', 'applet', 'silverlight' ],
				maturity: [ 'everyone', 'teen', 'adult' ],
				status: [ 'complete', 'wip' ],
				// referrals: [ 'enabled', 'disabled' ],
			};

			this.onPopoverShown = function( filter )
			{
				this.visiblePopovers[ filter ] = true;
			};

			this.onPopoverHidden = function( filter )
			{
				this.visiblePopovers[ filter ] = false;
			};

			this.toggleFilterOption = function( filter, option )
			{
				var label = filter + '-' + option;
				if ( this.filteringContainer.isFilterOptionSet( filter, option ) ) {
					Analytics.trackEvent( 'game-filtering', 'toggle', label + '-off' );
				}
				else {
					Analytics.trackEvent( 'game-filtering', 'toggle', label + '-on' );
				}

				this.filteringContainer.toggleFilterOption( filter, option );
				this.filteringContainer.onChanged();
			};

			this.getJolticon = function( filter, option )
			{
				if ( filter == 'os' ) {
					return 'jolticon-' + (option == 'other' ? 'other-os' : option);
				}
				else if ( filter == 'browser' ) {
					if ( option == 'html' ) {
						return 'jolticon-html5';
					}
					else if ( option == 'applet' ) {
						return 'jolticon-java';
					}
					else {
						return 'jolticon-' + option;
					}
				}
			};
		}
	};
} );
