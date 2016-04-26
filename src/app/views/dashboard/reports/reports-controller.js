angular.module( 'App.Views' ).controller( 'Dashboard.ReportsCtrl', function( $scope, $state, App, Api, Game, Graph, SiteAnalytics, Geo, gettextCatalog, payload )
{
	var _this = this;

	App.title = gettextCatalog.getString( 'Reports' );

	this.games = Game.populate( payload.games );
	this.breakdownReports = [];

	this.stats = [
		{
			eventType: 'view',
			label: gettextCatalog.getString( 'Views' ),
			type: 'number',
		},
		{
			eventType: 'download',
			label: gettextCatalog.getString( 'Downloads' ),
			type: 'number',
		},
		// {
		// 	eventType: 'install',
		// 	label: gettextCatalog.getString( 'Installs' ),
		// 	type: 'number',
		// },
		{
			eventType: 'comment',
			label: gettextCatalog.getString( 'Comments' ),
			type: 'number',
		},
		{
			eventType: 'rating',
			label: gettextCatalog.getString( 'Ratings' ),
			type: 'number',
		},
		{
			eventType: 'follow',
			label: gettextCatalog.getString( 'Follows' ),
			type: 'number',
		},
		// {
		// 	eventType: 'sale',
		// 	label: gettextCatalog.getString( 'Sales' ),
		// 	type: 'number',
		// },
		// {
		// 	eventType: 'sale',
		// 	label: gettextCatalog.getString( 'Revenue' ),
		// 	type: 'currency',
		// },
	];

	var _allEventTypes = _.pluck( this.stats, 'eventType' );

	this.stateChanged = function( $stateParams )
	{
		this.period = $stateParams.period || 'all';
		this.eventType = $stateParams.eventType || 'view';
		this.resource = $stateParams.resource || 'Game';
		this.resourceId = parseInt( $stateParams.resourceId, 10 ) || this.games[0].id;
		this.stat = _.find( this.stats, { eventType: this.eventType } );
		this.game = _.find( this.games, { id: this.resourceId } );

		// If any of the parameters changed, refresh the state.
		if (
			this.period != $stateParams.period
			|| this.eventType != $stateParams.eventType
			|| this.resource != $stateParams.resource
			|| this.resourceId != $stateParams.resourceId
		) {
			$state.go(
				'dashboard.reports.view',
				_.pick( this, [ 'period', 'eventType', 'resource', 'resourceId' ] ),
				{ location: 'replace' }
			);
			return;
		}

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
		'reportsCtrl.period',
		'reportsCtrl.resource',
		'reportsCtrl.resourceId',
		'reportsCtrl.startTime',
		'reportsCtrl.endTime',
	];

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
		'reportsCtrl.eventType',
	] ),
	function()
	{
		if ( _this.period && _this.resource && _this.resourceId && _this.eventType ) {
			_this.changeReport( _this.stat );
		}
	} );

	this.histograms = function()
	{
		return SiteAnalytics.getHistogram( _this.resource, _this.resourceId, _allEventTypes, [ this.startTime, this.endTime ] )
			.then( function( data )
			{
				angular.extend( _this, data );
			} );
	};

	this.counts = function()
	{
		return SiteAnalytics.getCount( _this.resource, _this.resourceId, _allEventTypes )
			.then( function( data )
			{
				angular.extend( _this, data );
			} );
	};

	this.getReport = function( field, title, fieldLabel )
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
			}
		};

		Api.sendRequest( '/web/dash/reports/display', request, { detach: true, sanitizeComplexData: false } )
			.then( function( response )
			{
				var graph = [];

				// country code => country name
				if ( field == 'country' ) {
					var data = {};
					angular.forEach( response.top.result, function( val, key )
					{
						data[ Geo.getCountryName( key ) || key ] = val;
					} );
					response.top.result = data;
				}

				if ( field != 'rating' ) {

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
			// this.getReport( 'domain', 'Sources', 'Domain' );
			this.getReport( 'source', 'Referring Pages', 'Page' );
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
