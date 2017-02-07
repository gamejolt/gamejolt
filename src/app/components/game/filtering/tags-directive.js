angular.module( 'App.Game.Filtering' ).directive( 'gjGameFilteringTags', function( Game_Filtering_Container )
{
	return {
		scope: {
			filteringContainer: '=gjFilteringContainer',
		},
		template: require( '!html-loader!./tags.html' ),
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope, $state, $stateParams, Analytics )
		{
			var _this = this;

			$scope.Game_Filtering_Container = Game_Filtering_Container;

			getGenre();
			$scope.$on( '$stateChangeSuccess', getGenre );

			this.removeFilterOption = function( filter, option )
			{
				Analytics.trackEvent( 'game-filtering', 'remove', filter + '-' + option );

				this.filteringContainer.unsetFilter( filter, option );
				this.filteringContainer.onChanged();
			};

			function getGenre()
			{
				_this.genre = $stateParams.category || null;
			}

			this.clearGenre = function()
			{
				$state.go( $state.current, { category: undefined, page: undefined } );
			};
		}
	};
} );
