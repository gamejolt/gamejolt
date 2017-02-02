angular.module( 'App.Sorting' ).directive( 'gjSorting', function()
{
	return {
		template: require( '!html-loader!./sorting.html' ),
		scope: {},
		bindToController: {
			options: '=sortingOptions',
		},
		controllerAs: 'ctrl',
		controller: function( $scope, $state, $stateParams, Popover )
		{
			var _this = this;

			$scope.$state = $state;
			$scope.$stateParams = $stateParams;

			// This stores our own copy of state information that we can update any time the
			// state changes. This allows us to make a binding based on this "immutable" object
			// and only update when this actually changes.
			var i = 0;
			function updateStateData()
			{
				_this.stateData = {
					id: ++i,
					name: $state.current.name,
					params: angular.copy( $stateParams ),
				};
			}

			$scope.$on( '$stateChangeSuccess', updateStateData );
			updateStateData();

			this.closePopover = function()
			{
				Popover.hideAll();
			};

			/**
			 * We just add the sorting information to the current state params.
			 */
			this.getStateParams = function( params, sort )
			{
				var stateParams = angular.copy( params );
				stateParams.sort = sort;
				return stateParams;
			};
		}
	};
} );
