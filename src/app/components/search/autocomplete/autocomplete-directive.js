angular.module( 'App.Search' ).directive( 'gjSearchAutocomplete', function( gettext )
{
	var KEYCODE_UP = 38;
	var KEYCODE_DOWN = 40;
	var KEYCODE_ENTER = 13;
	var KEYCODE_ESC = 27;

	return {
		restrict: 'E',
		require: '^gjSearch',
		templateUrl: '/app/components/search/autocomplete/autocomplete.html',
		scope: {
			modes: '=?searchAutocompleteModes',
		},
		controllerAs: 'ctrl',
		bindToController: true,
		link: {
			pre: function( scope, element, attrs, searchCtrl )
			{
				scope.searchCtrl = searchCtrl;
				scope.ctrl.init();
			}
		},
		controller: function(
			$rootScope, $scope, $element, $state, $injector, $timeout,
			Environment, App, Analytics, Search, Search_History, Fuzzysearch, Popover,
			User, Game,
			orderByFilter, hotkeys )
		{
			var _this = this;

			$scope.Environment = Environment;

			var LocalDb_Game = Environment.isClient ? $injector.get( 'LocalDb_Game' ) : null;

			this.mode = 'search';
			this.modes = this.modes || [ 'search', 'command' ];
			this.isVisible = false;

			this.selected = 0;
			this.games = [];
			this.users = [];
			this.libraryGames = [];
			this.items = [];

			this.commands = [
				{
					keyword: ':discover',
					state: 'discover.home',
					description: gettext( 'commands.discover_description' ),
				},
				{
					keyword: ':games',
					state: 'discover.games.list.section',
					options: { section: 'featured' },
					description: gettext( 'commands.games_description' ),
				},
				{
					keyword: ':news',
					state: 'discover.news.list',
					description: gettext( 'commands.news_description' ),
				},
				{
					keyword: ':dashboard',
					state: 'dashboard.overview',
					authRequired: true,
					description: gettext( 'commands.dashboard_description' ),
				},
				{
					keyword: ':library',
					state: 'library.overview',
					authRequired: true,
					description: gettext( 'commands.library_description' ),
				},
				{
					keyword: ':installed',
					state: 'library.installed',
					clientRequired: true,
					description: gettext( 'commands.installed_description' ),
				},
				{
					keyword: ':account',
					state: 'dashboard.account.edit',
					authRequired: true,
					description: gettext( 'commands.account_description' ),
				},
				{
					keyword: ':activity',
					state: 'dashboard.activity.list',
					authRequired: true,
					description: gettext( 'commands.activity_description' ),
				},
				{
					keyword: ':settings',
					state: 'settings',
					authRequired: true,
					description: gettext( 'commands.settings_description' ),
				},
			];

			this.commands = orderByFilter( this.commands, 'keyword' );
			this.filteredCommands = this.commands;

			this.init = function()
			{
				$scope.searchCtrl.setKeydownSpy( function( event )
				{
					var min = 0;
					var max = 0;

					if ( _this.mode == 'search' ) {
						max = _this.items.length;
					}
					else if ( _this.mode == 'command' ) {
						max = _this.filteredCommands.length - 1;
					}

					if ( event.keyCode == KEYCODE_DOWN ) {
						_this.selected = Math.min( _this.selected + 1, max );
					}
					else if ( event.keyCode == KEYCODE_UP ) {
						_this.selected = Math.max( _this.selected - 1, min );
					}
					else if ( event.keyCode == KEYCODE_ENTER ) {
						_this.selectActive();
					}
					else if ( event.keyCode == KEYCODE_ESC ) {

						// If they had a command in there but escaped, then remove the whole command.
						if ( _this.mode == 'command' ) {
							$scope.searchCtrl.query = '';
						}
					}
				} );

				$scope.$watchGroup( [ 'searchCtrl.isFocused', 'searchCtrl.isEmpty()' ], function( vals )
				{
					var isFocused = vals[0];
					var isEmpty = vals[1];

					if ( isFocused && !isEmpty ) {
						_this.showAutocomplete( $scope.searchCtrl.searchElem );
					}
					else {
						_this.hideAutocomplete();
					}
				} );

				$scope.$watch( 'searchCtrl.query', function()
				{
					_this.onChange();
				} );

				function setCaretPosition( el, caretPos )
				{
					// This is used to not only get "focus", but
					// to make sure we don't have it everything -selected-
					// (it causes an issue in chrome, and having it doesn't hurt any other browser)
					el.value = el.value;

					if ( el !== null ) {
						if ( el.createTextRange ) {
							var range = el.createTextRange();
							range.move( 'character', caretPos );
							range.select();
						}
						// (el.selectionStart === 0 added for Firefox bug)
						else if ( el.selectionStart || el.selectionStart === 0 ) {
							el.focus();
							el.setSelectionRange( caretPos, caretPos );
						}
					}
				}

				// Fast command input.
				hotkeys.bindTo( $scope )
					.add( {
						combo: ':',
						description: 'Focus the search bar for command input.',
						callback: function( $event )
						{
							// Get around stupid scope already in progress.
							$timeout( function()
							{
								$event.preventDefault();
								$scope.searchCtrl.query = ':';

								// We push their cursor after the ":".
								// This will also focus it.
								setCaretPosition( $scope.searchCtrl.inputElem[0], 1 );
							} );
						}
					} );
			};

			this.getPopover = function()
			{
				return Popover.getPopover( 'search-autocomplete' );
			};

			this.showAutocomplete = function( element )
			{
				if ( !this.isVisible && !$scope.searchCtrl.isEmpty() && this.inAvailableMode() ) {
					this.isVisible = true;
					this.getPopover().show( element );
				}
			};

			this.hideAutocomplete = function()
			{
				if ( this.isVisible ) {
					this.isVisible = false;
					this.getPopover().hide();
				}
			};

			this.inAvailableMode = function()
			{
				return this.modes.indexOf( this.mode ) !== -1;
			};

			this.sendSearch = _.debounce( function()
			{
				if ( $scope.searchCtrl.isEmpty() || !_this.inAvailableMode() ) {
					return;
				}

				// We store the query that we're waiting on.
				var thisQuery = $scope.searchCtrl.query;
				Search.search( thisQuery, { type: 'typeahead' } ).then( function( payload )
				{
					// We only update the payload if the query is still the same as when we sent.
					// This makes sure we don't step on ourselves while typing fast.
					// Payloads may not come back sequentially.
					if ( $scope.searchCtrl.query === thisQuery ) {
						_this.games = payload.games;
						_this.users = payload.users;
						_this.libraryGames = payload.libraryGames;

						// All items so we can calculate global selection indexes easily.
						// This needs to be in the order that they will show in the results list.
						_this.items = []
							.concat( _this.libraryGames )
							.concat( _this.games )
							.concat( _this.users )
							;
					}
				} );
			}, 200, { leading: false, maxWait: 750, trailing: true } );

			this.selectActive = function()
			{
				if ( $scope.searchCtrl.isEmpty() ) {
					return;
				}

				if ( this.mode == 'search' ) {
					Search_History.record( $scope.searchCtrl.query );

					// Selected the "show all results" option.
					if ( this.selected === 0 ) {
						this.viewAll();
					}
					else {
						var item = this.items[ (this.selected - 1) ];
						if ( item instanceof Game ) {
							this.selectGame( item );
						}
						else if ( item instanceof User ) {
							this.selectUser( item );
						}
						else if ( Environment.isClient && item instanceof LocalDb_Game ) {
							this.selectLibraryGame( item );
						}
					}
				}
				else if ( this.mode == 'command' ) {
					var command = this.filteredCommands[ this.selected ];
					this.selectCommand( command );
				}

				$scope.searchCtrl.blur();
			};

			this.viewAll = function()
			{
				$state.go( 'search.results', { q: $scope.searchCtrl.query } );
				Analytics.trackEvent( 'search', 'autocomplete', 'go-all' );
			};

			this.selectGame = function( game )
			{
				$state.go( 'discover.games.view.overview', { slug: game.slug, id: game.id } );
				Analytics.trackEvent( 'search', 'autocomplete', 'go-game' );
			};

			this.selectUser = function( user )
			{
				$state.go( 'profile.overview', { slug: user.slug, id: user.id } );
				Analytics.trackEvent( 'search', 'autocomplete', 'go-user' );
			};

			this.selectLibraryGame = function( localGame )
			{
				$state.go( 'discover.games.view.overview', { slug: localGame.slug, id: localGame.id } );
				Analytics.trackEvent( 'search', 'autocomplete', 'go-library-game' );
			};

			this.selectCommand = function( command )
			{
				if ( command && command.state ) {
					$scope.searchCtrl.query = '';  // Set it as blank.
					$state.go( command.state, command.options || {} );
					Analytics.trackEvent( 'search', 'autocomplete', 'go-command' );
				}
			};

			this.onChange = function()
			{
				// Reset the selected index.
				this.selected = 0;

				if ( $scope.searchCtrl.isEmpty() ) {
					return;
				}

				if ( $scope.searchCtrl.query[0] == ':' ) {
					this.mode = 'command';
					this.filteredCommands = [];

					for ( var i = 0; i < this.commands.length; ++i ) {
						if ( !App.user && this.commands[ i ].authRequired ) {
							continue;
						}

						if ( !Environment.isClient && this.commands[ i ].clientRequired ) {
							continue;
						}

						if ( $scope.searchCtrl.query.length === 1
							|| Fuzzysearch( $scope.searchCtrl.query.toLowerCase(), this.commands[ i ].keyword )
						) {
							this.filteredCommands.push( this.commands[ i ] );
						}
					}
				}
				else {
					this.mode = 'search';
					this.sendSearch();
				}
			};
		},
	};
} );
