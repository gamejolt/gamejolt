angular.module( 'App.Views' ).controller( 'Dashboard.AnalyticsCtrl', function(
	$scope, $state, App, Api, Payload, Game, Game_Package, Game_Release, Graph, SiteAnalytics, Geo, gettextCatalog, payload )
{
	var _this = this;

	/**
	 * When the page first loads we check the state params to make sure they are all filled in.
	 * If they weren't, we change the URL. When this happens it'll replace the previous URL
	 * unless we skip the replacement. After our initial params are bootstrapped it's fine to
	 * replace the URL from there on out.
	 */
	var paramsBootstrapped = false;

	App.title = gettextCatalog.getString( 'Analytics' );

	this.games = Game.populate( payload.games );
	this.breakdownReports = [];

	this.stats = {
		view: {
			eventType: 'view',
			label: gettextCatalog.getString( 'Views' ),
			type: 'number',
		},
		download: {
			eventType: 'download',
			label: gettextCatalog.getString( 'Downloads' ),
			type: 'number',
		},
		// install: {
		// 	eventType: 'install',
		// 	label: gettextCatalog.getString( 'Installs' ),
		// 	type: 'number',
		// },
		comment: {
			eventType: 'comment',
			label: gettextCatalog.getString( 'Comments' ),
			type: 'number',
		},
		rating: {
			eventType: 'rating',
			label: gettextCatalog.getString( 'Ratings' ),
			type: 'number',
		},
		follow: {
			eventType: 'follow',
			label: gettextCatalog.getString( 'Follows' ),
			type: 'number',
		},
		// sale: {
		// 	eventType: 'sale',
		// 	label: gettextCatalog.getString( 'Sales' ),
		// 	type: 'number',
		// },
		// revenue: {
		// 	eventType: 'revenue',
		// 	label: gettextCatalog.getString( 'Revenue' ),
		// 	type: 'currency',
		// },
	};

	var _gameEventTypes = Object.keys( this.stats );
	var _packageEventTypes = [ 'download' ];
	var _releaseEventTypes = [ 'download' ];

	this.stateChanged = function( $stateParams )
	{
		this.period = $stateParams.period || 'monthly';
		this.resource = $stateParams.resource || 'Game';
		this.resourceId = parseInt( $stateParams.resourceId, 10 ) || this.games[0].id;

		if ( this.resource == 'Game' ) {
			this.eventTypes = _gameEventTypes;
			this.eventType = $stateParams.eventType || 'view';
		}
		else if ( this.resource == 'Game_Package' ) {
			this.eventTypes = _packageEventTypes;
			this.eventType = $stateParams.eventType || 'download';
		}
		else if ( this.resource == 'Game_Release' ) {
			this.eventTypes = _releaseEventTypes;
			this.eventType = $stateParams.eventType || 'download';
		}
		else {
			throw new Error( 'Invalid resource.' );
		}

		this.stat = this.stats[ this.eventType ];

		// If any of the parameters changed, refresh the state.
		if (
			this.period != $stateParams.period
			|| this.eventType != $stateParams.eventType
			|| this.resource != $stateParams.resource
			|| this.resourceId != $stateParams.resourceId
		) {
			var options = {};
			if ( paramsBootstrapped ) {
				options = { location: 'replace' };
			}

			$state.go(
				'dashboard.analytics.view',
				_.pick( this, [ 'period', 'eventType', 'resource', 'resourceId' ] ),
				options
			);

			paramsBootstrapped = true;
			return;
		}

		paramsBootstrapped = true;

		this.now = Date.now();
		this.startTime = null;
		this.endTime = null;

		this.prevMonth = null;
		this.prevYear = null;

		this.nextMonth = null;
		this.nextYear = null;
		if ( this.period == 'monthly' ) {

			var date = new Date();
			var year, month;
			if ( !$stateParams.year || !$stateParams.month ) {
				year = date.getFullYear();
				month = date.getMonth();
			}
			else {
				year = parseInt( $stateParams.year, 10 );
				month = parseInt( $stateParams.month, 10 );
			}

			this.startTime = (new Date( year, month, 1 )).getTime();
			this.endTime = (new Date( year, month + 1, 0 )).getTime();

			this.prevMonth = (new Date( year, month - 1, 1 )).getMonth();
			this.prevYear = (new Date( year, month - 1, 1 )).getFullYear();

			this.nextMonth = (new Date( year, month + 1, 1 )).getMonth();
			this.nextYear = (new Date( year, month + 1, 1 )).getFullYear();
		}
	};

	var globalWatch = [
		'analyticsCtrl.period',
		'analyticsCtrl.resource',
		'analyticsCtrl.resourceId',
		'analyticsCtrl.startTime',
		'analyticsCtrl.endTime',
	];

	$scope.$watchGroup( [ 'analyticsCtrl.resource', 'analyticsCtrl.resourceId' ], function()
	{
		Api.sendRequest( '/web/dash/analytics/get-resource/' + _this.resource + '/' + _this.resourceId )
			.then( function( _payload )
			{
				_this.game = _payload.game ? new Game( _payload.game ) : null;
				_this.package = _payload.package ? new Game_Package( _payload.package ) : null;
				_this.release = _payload.release ? new Game_Release( _payload.release ) : null;
			} );
	} );

	// Only the fields that can affect histograms.
	$scope.$watchGroup( globalWatch, function()
	{
		if ( _this.resource && _this.resourceId ) {
			if ( _this.period == 'all' ) {
				_this.counts();
			}
			else if ( _this.period == 'monthly' ) {
				_this.histograms();
			}
		}
	} );

	// Only the fields that can affect report breakdowns.
	$scope.$watchGroup( globalWatch.concat( [
		'analyticsCtrl.eventType',
	] ),
	function()
	{
		if ( _this.period && _this.resource && _this.resourceId && _this.eventType ) {
			_this.changeReport( _this.stat );
		}
	} );

	this.histograms = function()
	{
		return SiteAnalytics.getHistogram( _this.resource, _this.resourceId, this.eventTypes, [ this.startTime, this.endTime ] )
			.then( function( data )
			{
				angular.extend( _this, data );
			} );
	};

	this.counts = function()
	{
		return SiteAnalytics.getCount( _this.resource, _this.resourceId, this.eventTypes )
			.then( function( data )
			{
				angular.extend( _this, data );
			} );
	};

	this.getReport = function( field, title, fieldLabel, extraRequestData )
	{
		var type = 'top';
		if ( field == 'rating' ) {
			type = 'rating-breakdown';
		}

		var report = {
			type: type,
			title: title,
			field: field,
			fieldLabel: fieldLabel,
			isLoaded: false,
		};

		this.breakdownReports.push( report );

		var date = new Date();
		var request = {
			top: {
				target: _this.resource,
				target_id: this.resourceId,
				collection: this.eventType + 's',
				analyzer: 'top-composition',
				field: field,
				from_date: this.startTime / 1000,
				to_date: this.endTime / 1000,
				timezone: date.getTimezoneOffset(),
			},
		};

		if ( extraRequestData ) {
			angular.extend( request.top, extraRequestData );
		}

		Api.sendRequest( '/web/dash/analytics/display', request, { sanitizeComplexData: false } )
			.then( function( response )
			{
				var graph = null;

				// country code => country name
				if ( field == 'country' ) {
					var data = {};
					angular.forEach( response.top.result, function( val, key )
					{
						if ( key == 'other' ) {
							data[ gettextCatalog.getString( 'Unknown' ) ] = val;
						}
						else {
							data[ Geo.getCountryName( key ) || key ] = val;
						}
					} );
					response.top.result = data;
				}

				if ( field != 'rating' && field != 'source_url' ) {

					graph = [];

					// Pull the top 3 results so we can push into a pie chart if desired.
					var i = 0, total = 0;
					angular.forEach( response.top.result, function( val, key )
					{
						if ( i < 3 ) {
							graph.push( {
								label: key,
								value: val,
							} );
							total += val;
						}
						++i;
					} );

				}

				if ( field == 'rating' ) {
					var data = {};
					[ 1, 2, 3, 4, 5 ].forEach( function( rating )
					{
						data[ rating ] = response.top.result[ rating ] || 0;
					} );
					response.top.result = data;
				}

				report.data = response.top.result;
				report.graph = graph;
				report.total = response.top.total;
				report.isLoaded = true;
				report.hasData = report.data && Object.keys( report.data ).length > 0;
			} );
	};

	this.changeReport = function( stat )
	{
		this.eventType = stat.eventType;
		this.breakdownReports = [];

		if ( this.eventType == 'download' ) {
			this.getReport( 'os', 'Operating Systems', 'OS' );
		}

		if ( this.eventType == 'view' || this.eventType == 'download' ) {
			this.getReport( 'source', 'Top Sources', 'Domain', { conditions: [ 'source-gamejolt' ] } );
			this.getReport( 'source_url', 'Referring Pages', 'Page' );
			this.getReport( 'country', 'Countries', 'Country' );
		}

		if ( this.eventType == 'install' ) {
			this.getReport( 'os', 'Operating Systems', 'OS' );
			this.getReport( 'country', 'Countries', 'Country' );
		}

		if ( this.eventType == 'comment' ) {
			this.getReport( 'comment_language', 'Languages', 'Language' );
		}

		if ( this.eventType == 'rating' ) {
			this.getReport( 'rating', 'Rating Breakdown', 'Rating' );
		}

		if ( this.eventType == 'follow' ) {
			this.getReport( 'country', 'Countries', 'Country' );
		}
	};
} );
