angular.module( 'App.Search' ).directive( 'gjSearch', function()
{
	var _globalId = 0;

	return {
		restrict: 'E',
		templateUrl: '/app/components/search/search.html',
		scope: {
			autocompleteDisabled: '=?gjSearchAutocompleteDisable',
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope, $timeout, $element, Search, hotkeys )
		{
			var _this = this;

			this.id = ++_globalId;
			this.query = Search.query;
			this.isFocused = false;
			this.searchElem = $element;
			this.inputElem = null;

			this.isEmpty = function()
			{
				return !this.query.trim();
			};

			this.focus = function()
			{
				if ( this.inputElem ) {
					$timeout( function()
					{
						_this.inputElem[0].focus();
					} );
				}
			};

			this.blur = function()
			{
				if ( this.inputElem ) {
					$timeout( function()
					{
						_this.inputElem[0].blur();
					} );
				}
			};

			// Ability to set watchers for when a keydown event fires.
			this.keydownSpies = [];
			this.setKeydownSpy = function( fn )
			{
				this.keydownSpies.push( fn );
			};

			this.onKeydown = function( event )
			{
				angular.forEach( this.keydownSpies, function( spy )
				{
					spy( event );
				} );
			};

			hotkeys.bindTo( $scope )
				.add( {
					combo: 's',
					description: 'Focus the search bar.',
					callback: function( $event )
					{
						_this.focus();
						$event.preventDefault();
					}
				} );
		},
	}
} );
