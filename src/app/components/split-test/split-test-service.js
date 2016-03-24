angular.module( 'App.SplitTest' ).service( 'SplitTest', function( $location, $window )
{
	var EXPERIMENT_CLEAN_GAME_FILTERS = '2D1DwVrASM-bZA8JBMR7tQ';
	var EXPERIMENT_GAME_COVER_BUTTONS = 'pDWxzKESTYqlR8PgPWCfVQ';

	this.hasCleanGameFilters = function( payload )
	{
		return getVariation( payload, EXPERIMENT_CLEAN_GAME_FILTERS ) == 1;
	};

	this.getGameCoverButtons = function( payload )
	{
		var variation = getVariation( payload, EXPERIMENT_GAME_COVER_BUTTONS );

		if ( variation == 1 ) {
			return 'buttons';
		}
		else if ( variation == 2 ) {
			return 'lg-buttons';
		}

		return 'original';
	};

	function getVariation( payload, experiment )
	{
		// Allows you to put the experiment in the URL to force it.
		// Example: /games/best?oCnfrO9TSku9N0t3viKvKg=1
		var queryParams = $location.search();
		if ( queryParams[ experiment ] ) {
			return parseInt( queryParams[ experiment ], 10 );
		}

		// Allow you to force an experiment variation permanently through localStorage.
		if ( $window.localStorage[ experiment ] ) {
			return parseInt( $window.localStorage[ experiment ], 10 );
		}

		if ( angular.isDefined( payload._experiment ) && angular.isDefined( payload._variation ) ) {
			if ( payload._experiment == experiment ) {
				return payload._variation;
			}
		}

		return -1;
	}
} );
