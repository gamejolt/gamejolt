angular.module( 'App.Search' ).directive( 'gjSearchInput', function( Search )
{
	var KEYCODE_UP = 38;
	var KEYCODE_DOWN = 40;
	var KEYCODE_ENTER = 13;
	var KEYCODE_ESC = 27;

	return {
		restrict: 'A',
		require: [ 'ngModel', '^gjSearch' ],
		scope: {},
		controllerAs: 'ctrl',
		link: {
			pre: function( scope, element, attrs, ctrls )
			{
				var modelCtrl = ctrls[0];
				scope.searchCtrl = ctrls[1];

				// Obviouisly don't want browser autocomplete popping over.
				element[0].autocomplete = 'off';

				// Sync from the global search query to our input.
				scope.$watch( function()
				{
					return Search.query;
				},
				function()
				{
					modelCtrl.$setViewValue( Search.query );
					modelCtrl.$render();
				} );

				scope.ctrl.init();
			}
		},
		controller: function( $scope, $element, $state, Search_History )
		{
			this.init = function()
			{
				$scope.searchCtrl.inputElem = $element;

				// Helper to run the event handler in an $apply.
				function runHandlerInApply( fn )
				{
					return function( event ) {
						$scope.$applyAsync( function()
						{
							fn( event );
						} );
					};
				}

				$element.on( 'focus', runHandlerInApply( function()
				{
					$scope.searchCtrl.isFocused = true;
				} ) );

				$element.on( 'blur', runHandlerInApply( function()
				{
					$scope.searchCtrl.isFocused = false;
				} ) );

				$element.on( 'keydown', runHandlerInApply( function( event )
				{
					// This stops the default behavior from happening when we press up/down
					// or enter (we don't want to submit form).
					if ( event.keyCode == KEYCODE_ESC
						|| event.keyCode == KEYCODE_UP
						|| event.keyCode == KEYCODE_DOWN
						|| event.keyCode == KEYCODE_ENTER
					) {
						event.preventDefault();
					}

					// If autocomplete is disabled, then we want to submit the form on enter.
					// Normally the autocomplete will take control of the submission since they
					// technically highlight what they want in autocomplete and go to it.
					if ( $scope.searchCtrl.autocompleteDisabled && event.keyCode == KEYCODE_ENTER ) {
						Search_History.record( $scope.searchCtrl.query );
						$state.go( 'search.results', { q: $scope.searchCtrl.query } );
					}

					// We want to blur the input on escape.
					if ( event.keyCode == KEYCODE_ESC ) {
						$scope.searchCtrl.blur();
						event.stopPropagation();
					}

					// Let our parent know that a keydown event happened.
					$scope.searchCtrl.onKeydown( event );
				} ) );
			};
		},
	};
} );
