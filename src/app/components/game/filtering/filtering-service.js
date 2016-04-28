angular.module( 'App.Game.Filtering' ).factory( 'Game_Filtering_Container', function( $ocLazyLoad, $q, $window, $state, $location, $injector, Environment, gettextCatalog )
{
	var STORAGE_KEY = 'game-filtering:filters';

	Game_Filtering_Container.filterDefinitions = {
		os: {
			label: gettextCatalog.getString( 'games.filtering.os' ),
			type: 'array',
			options: {
				windows: gettextCatalog.getString( 'games.filtering.os_windows' ),
				mac: gettextCatalog.getString( 'games.filtering.os_mac' ),
				linux: gettextCatalog.getString( 'games.filtering.os_linux' ),
				other: gettextCatalog.getString( 'games.filtering.os_other' ),
				rom: gettextCatalog.getString( 'ROM' ),
			}
		},
		browser: {
			label: gettextCatalog.getString( 'games.filtering.browser' ),
			type: 'array',
			options: {
				html: gettextCatalog.getString( 'games.filtering.browser_html' ),
				flash: gettextCatalog.getString( 'games.filtering.browser_flash' ),
				unity: gettextCatalog.getString( 'games.filtering.browser_unity' ),
				applet: gettextCatalog.getString( 'games.filtering.browser_applet' ),
				silverlight: gettextCatalog.getString( 'games.filtering.browser_silverlight' ),
			}
		},
		maturity: {
			label: gettextCatalog.getString( 'games.filtering.maturity' ),
			type: 'array',
			options: {
				everyone: gettextCatalog.getString( 'games.filtering.maturity_everyone' ),
				teen: gettextCatalog.getString( 'games.filtering.maturity_teen' ),
				adult: gettextCatalog.getString( 'games.filtering.maturity_adult' ),
			}
		},
		status: {
			label: gettextCatalog.getString( 'games.filtering.status' ),
			type: 'array',
			options: {
				complete: gettextCatalog.getString( 'games.filtering.status_complete' ),
				wip: gettextCatalog.getString( 'games.filtering.status_wip' ),
				canceled: gettextCatalog.getString( 'games.filtering.status_canceled' ),
			}
		},
		query: {
			label: 'Filter',
			type: 'string',
		},
	};

	function isEmpty( filters, options )
	{
		options = options || {};

		var isEmpty = true;
		angular.forEach( filters, function( value, key )
		{
			if ( !Game_Filtering_Container.filterDefinitions[ key ] ) {
				return;
			}
			var definition = Game_Filtering_Container.filterDefinitions[ key ];

			if ( definition.type == 'array' && value.length ) {
				isEmpty = false;
			}
			else if ( definition.type == 'radio' && value ) {
				isEmpty = false;
			}
			else if ( !options.skipQuery && definition.type == 'string' && value.trim() ) {
				isEmpty = false;
			}
		} );

		return isEmpty;
	}

	function updateUrl( state, stateParams, filters )
	{
		var params = angular.extend( {}, stateParams, filters );

		// #! gets added in Client/App but we never want it.
		$location.url( $state.href( state, params ).replace( '#!', '' ) );
	}

	function Game_Filtering_Container()
	{
		// Default all filters to empty values.
		this.filters = {};
		angular.forEach( Game_Filtering_Container.filterDefinitions, function( definition, key )
		{
			if ( definition.type == 'array' ) {
				this.filters[ key ] = [];
			}
			else if ( definition.type == 'string' ) {
				this.filters[ key ] = '';
			}
			else if ( definition.type == 'radio' ) {
				this.filters[ key ] = null;
			}
		}, this );

		// This is whether or not the filters are empty that we need for tags.
		// It doesn't include the query filter.
		this.areTagFiltersEmpty = true;

		// Whether or not we should store these filters in the browser.
		this.isPersistent = true;

		// Whether or not we should try to detect their OS to set filters if they don't have any set.
		this.shouldDetect = true;
	}

	Game_Filtering_Container.prototype.init = function( state, stateParams )
	{
		var _this = this;

		// Gotta load ua-parser before referencing Device.
		return $ocLazyLoad.load( '/app/modules/ua-parser.js' ).then( function()
		{
			/**
			 * We basically don't resolve if we're switching the URL.
			 * This prevents any API calls from going out.
			 * We do resolve when we're just pulling the filters from the URL or if there
			 * are no filters to set.
			 */
			return $q( function( resolve, reject )
			{
				var paramFiltersFound = false;
				angular.forEach( stateParams, function( value, param )
				{
					if ( Game_Filtering_Container.filterDefinitions[ param ] && value ) {
						paramFiltersFound = true;
					}
				} );

				if ( paramFiltersFound ) {
					// console.log( 'from url' );

					// We don't save the filters if we pull from the URL.
					// We only save when they explicitly set/change them.
					// This ensures that they can view a shared URL with them without overwriting their filters.
					angular.forEach( Game_Filtering_Container.filterDefinitions, function( definition, filter )
					{
						if ( stateParams[ filter ] ) {
							if ( definition.type == 'array' ) {
								_this.filters[ filter ] = stateParams[ filter ].split( ',' );
							}
							else if ( definition.type == 'string' ) {
								_this.filters[ filter ] = stateParams[ filter ];
							}
							else if ( definition.type == 'radio' ) {
								_this.filters[ filter ] = stateParams[ filter ];
							}
						}
						else {
							if ( definition.type == 'array' ) {
								_this.filters[ filter ] = [];
							}
							else if ( definition.type == 'string' ) {
								_this.filters[ filter ] = '';
							}
							else if ( definition.type == 'radio' ) {
								_this.filters[ filter ] = null;
							}
						}
					} );
				}
				// Only if this is a persistent filtering container.
				else if ( _this.isPersistent && $window.localStorage[ STORAGE_KEY ] ) {
					// console.log( 'from storage' );

					var filters = JSON.parse( $window.localStorage[ STORAGE_KEY ] );
					if ( filters && !isEmpty( filters ) ) {

						// Never resolve so we don't switch routes.
						var _filters = _this.getStateParams( filters );
						updateUrl( state, stateParams, _filters );
						return;
					}
				}
				// Don't auto detect any filters if we are prerendering.
				else if ( _this.shouldDetect && !Environment.isPrerender ) {
					// console.log( 'from device' );

					var os = $injector.get( 'Device' ).os();
					var filters = undefined;

					if ( os == 'windows' ) {
						filters = { os: [ 'windows' ] };
					}
					else if ( os == 'mac' ) {
						filters = { os: [ 'mac' ] };
					}
					else if ( os == 'linux' ) {
						filters = { os: [ 'linux' ] };
					}

					if ( filters ) {

						// Always add in all browser types if we auto-detected.
						// TODO: Would be nice to not have to manually add every single one in, but rather just a single filter for all browser types.
						if ( !Environment.isClient ) {
							filters.browser = Object.keys( Game_Filtering_Container.filterDefinitions.browser.options );
						}
						// On client we only do HTML for now.
						else {
							filters.browser = [ 'html' ];
						}

						// Never resolve so we don't switch routes.
						var _filters = _this.getStateParams( filters );
						updateUrl( state, stateParams, _filters );
						return;
					}
				}

				_this._syncTagFiltersEmpty();
				resolve();
			} );
		} );
	};

	Game_Filtering_Container.prototype.toggleFilterOption = function( filter, option )
	{
		if ( !Game_Filtering_Container.filterDefinitions[ filter ] || Game_Filtering_Container.filterDefinitions[ filter ].type == 'string' ) {
			return;
		}

		// If a radio type, we want to unset any previously set ones.
		if ( Game_Filtering_Container.filterDefinitions[ filter ].type == 'radio' ) {
			if ( this.filters[ filter ] == option ) {
				this.unsetFilter( filter, option );
			}
			else {
				this.setFilter( filter, option );
			}
			return;
		}

		if ( this.filters[ filter ].indexOf( option ) !== -1 ) {
			this.unsetFilter( filter, option );
		}
		else {
			this.setFilter( filter, option );
		}
	};

	Game_Filtering_Container.prototype.setFilter = function( filter, value )
	{
		if ( !Game_Filtering_Container.filterDefinitions[ filter ] ) {
			return;
		}
		var definition = Game_Filtering_Container.filterDefinitions[ filter ];

		if ( definition.type == 'array' ) {
			this.filters[ filter ].push( value );
		}
		else if ( definition.type == 'string' || definition.type == 'radio' ) {
			this.filters[ filter ] = value;
		}

		this.areTagFiltersEmpty = false;
		this._saveFilters();
	};

	Game_Filtering_Container.prototype.unsetFilter = function( filter, option )
	{
		if ( !Game_Filtering_Container.filterDefinitions[ filter ] ) {
			return;
		}
		var definition = Game_Filtering_Container.filterDefinitions[ filter ];

		if ( definition.type == 'array' ) {
			_.pull( this.filters[ filter ], option );
		}
		else if ( definition.type == 'string' ) {
			this.filters[ filter ] = '';
		}
		else if ( definition.type == 'radio' ) {
			this.filters[ filter ] = null;
		}

		this._syncTagFiltersEmpty();
		this._saveFilters();
	};

	Game_Filtering_Container.prototype.isFilterOptionSet = function( filter, option )
	{
		if ( !Game_Filtering_Container.filterDefinitions[ filter ] || Game_Filtering_Container.filterDefinitions[ filter ].type == 'string' ) {
			return null;
		}

		if ( Game_Filtering_Container.filterDefinitions[ filter ].type == 'radio' ) {
			return this.filters[ filter ] == option;
		}

		return this.filters[ filter ].indexOf( option ) !== -1;
	};

	Game_Filtering_Container.prototype._saveFilters = function()
	{
		// Early out if this isn't a persisent filtering container.
		if ( !this.isPersistent ) {
			return;
		}

		// We allow them to save/set blank filters as well.
		// This is so they can specifically say not to do our detected OS filters.
		$window.localStorage[ STORAGE_KEY ] = JSON.stringify( this.filters );
	};

	Game_Filtering_Container.prototype._syncTagFiltersEmpty = function()
	{
		this.areTagFiltersEmpty = isEmpty( this.filters, { skipQuery: true } );
	};

	Game_Filtering_Container.prototype.getQueryString = function( filters )
	{
		var queryString = '';
		var queryPieces = [];

		if ( angular.isUndefined( filters ) ) {
			filters = this.filters;
		}

		angular.forEach( Game_Filtering_Container.filterDefinitions, function( definition, filter )
		{
			if ( !filters[ filter ] ) {
				return;
			}

			var value = filters[ filter ];

			if ( definition.type == 'array' ) {
				if ( !value.length ) {
					return;
				}

				var filterParam = 'f_' + filter + '[]';
				angular.forEach( value, function( option )
				{
					queryPieces.push( filterParam + '=' + option );
				} );
			}
			else if ( definition.type == 'string' ) {
				if ( !value || !value.trim() ) {
					return;
				}

				queryPieces.push( filter + '=' + value );
			}
			else if ( definition.type == 'radio' ) {
				if ( !value ) {
					return;
				}

				queryPieces.push( 'f_' + filter + '=' + value );
			}
		}, this );

		return queryPieces.join( '&' );
	};

	Game_Filtering_Container.prototype.getStateParams = function( filters )
	{
		if ( angular.isUndefined( filters ) ) {
			filters = this.filters;
		}

		var params = {};
		angular.forEach( Game_Filtering_Container.filterDefinitions, function( definition, filter )
		{
			// Default state is undefined so it doesn't get included in URL.
			params[ filter ] = undefined;

			if ( !filters[ filter ] ) {
				return;
			}

			var value = filters[ filter ];

			if ( definition.type == 'array' ) {
				if ( !value.length ) {
					return;
				}

				// Make comma delimited lists of values.
				// Sort so the URL is always the same.
				params[ filter ] = value.sort().join( ',' );
			}
			else if ( definition.type == 'string' ) {
				if ( !value.trim() ) {
					return;
				}

				params[ filter ] = value;
			}
			else if ( definition.type == 'radio' ) {
				if ( !value ) {
					return;
				}

				params[ filter ] = value;
			}
		}, this );

		return params;
	};

	return Game_Filtering_Container;
} );
