angular.module( 'App.Views' ).controller( 'Dashboard.ReportsCtrl', function( $scope, App, Api, Graph, SiteAnalytics, Geo, gettextCatalog )
{
	var _this = this;

	App.title = gettextCatalog.getString( 'Reports' );

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
		{
			eventType: 'install',
			label: gettextCatalog.getString( 'Installs' ),
			type: 'number',
		},
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

	this.stateChanged = function( $stateParams )
	{
		this.period = $stateParams.period;
		this.eventType = $stateParams.eventType;
		this.resource = $stateParams.resource;
		this.resourceId = parseInt( $stateParams.resourceId, 10 );
		this.stat = _.find( this.stats, { eventType: this.eventType } );

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
		if ( _this.period == 'monthly' && _this.resource && _this.resourceId ) {
			_this.histograms();
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
		var eventTypes = [ 'view', 'download', 'install', 'comment', 'rating', 'follow' ];
		return SiteAnalytics.getHistogram( _this.resource, _this.resourceId, eventTypes, [ this.startTime, this.endTime ] )
			.then( function( data )
			{
				angular.forEach( data, function( eventData, eventType )
				{
					_this[ eventType ] = eventData;
				} );
			} );
	};

	var _reportIndex = 0;
	this.getReport = function( field, title, fieldLabel )
	{
		++_reportIndex;
		var ourReportIndex = _reportIndex;

		var request = {
			top: {
				target: _this.resource,
				target_id: this.resourceId,
				collection: this.eventType + 's',
				analyzer: 'top-composition',
				field: field,
				from_date: (Date.now() - (86400 * 1000 * 30)) / 1000,
				to_date: (Date.now() / 1000) + 86400,
			}
		};

		Api.sendRequest( '/web/dash/developer/games/graphs/display', request, { detach: true, sanitizeComplexData: false } )
			.then( function( response )
			{
				var graph = [];

				if ( field == 'country' ) {
					var data = {};
					angular.forEach( response.top.result, function( val, key )
					{
						data[ Geo.getCountryName( key ) || key ] = val;
					} );
					response.top.result = data;
				}

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

				if ( response.top.total - total > 0 ) {
					graph.push( {
						label: 'Other',
						value: (response.top.total - total),
					} );
				}

				_this.breakdownReports.push( {
					index: ourReportIndex,
					type: 'top',
					title: title,
					field: field,
					fieldLabel: fieldLabel,
					data: response.top.result,
					graph: graph,
					total: response.top.total,
				} );
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
	};

	this.getStatValue = function( stat )
	{
		if ( this[ stat.eventType ] ) {
			if ( this.period == 'all' ) {
				return this[ stat.eventType ].tableTotals[ stat.label ];
			}
			else {
				return this[ stat.eventType ].colTotals[ stat.label ];
			}
		}

		return stat.value;
	};
} );
