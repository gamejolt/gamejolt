angular.module( 'App.Views' ).controller( 'Dashboard.AnalyticsCtrl', function(
	$scope, $state, App, Api, Payload, Game, Game_Package, Game_Release, Graph, SiteAnalytics, gettextCatalog, payload )
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

	var metrics = [
		{
			key: 'view',
			collection: 'views',
			label: gettextCatalog.getString( 'Views' ),
			type: 'number',
		},
		{
			key: 'download',
			collection: 'downloads',
			label: gettextCatalog.getString( 'Downloads' ),
			type: 'number',
		},
		{
			key: 'install',
			collection: 'installs',
			label: gettextCatalog.getString( 'Installs' ),
			type: 'number',
		},
		{
			key: 'comment',
			collection: 'comments',
			label: gettextCatalog.getString( 'Comments' ),
			type: 'number',
		},
		{
			key: 'rating',
			collection: 'ratings',
			label: gettextCatalog.getString( 'Ratings' ),
			type: 'number',
		},
		{
			key: 'follow',
			collection: 'follows',
			label: gettextCatalog.getString( 'Follows' ),
			type: 'number',
		},
	];

	metrics.push( {
		key: 'sale',
		collection: 'sales',
		label: gettextCatalog.getString( 'Sales' ),
		type: 'number',
	} );

	metrics.push( {
		key: 'revenue',
		collection: 'sales',
		label: gettextCatalog.getString( 'Revenue' ),
		type: 'currency',
		field: 'revenue',
	} );

	this.allMetrics = _.indexBy( metrics, 'key' );
	var _gameMetrics = this.allMetrics;
	var _packageMetrics = _( this.allMetrics ).pick( [ 'download' ] ).value();
	var _releaseMetrics = _( this.allMetrics ).pick( [ 'download' ] ).value();

	this.stateChanged = function( $stateParams )
	{
		this.period = $stateParams.period || 'monthly';
		this.resource = $stateParams.resource || 'Game';
		this.resourceId = parseInt( $stateParams.resourceId, 10 ) || this.games[0].id;

		if ( this.resource == 'Game' ) {
			this.availableMetrics = _gameMetrics;
			this.metric = this.availableMetrics[ $stateParams.metricKey || 'view' ];
		}
		else if ( this.resource == 'Game_Package' ) {
			this.availableMetrics = _packageMetrics;
			this.metric = this.availableMetrics[ $stateParams.metricKey || 'download' ];
		}
		else if ( this.resource == 'Game_Release' ) {
			this.availableMetrics = _releaseMetrics;
			this.metric = this.availableMetrics[ $stateParams.metricKey || 'download' ];
		}
		else {
			throw new Error( 'Invalid resource.' );
		}

		// If any of the parameters changed, refresh the state.
		if (
			this.period != $stateParams.period
			|| this.metric.key != $stateParams.metricKey
			|| this.resource != $stateParams.resource
			|| this.resourceId != $stateParams.resourceId
		) {
			var options = {};
			if ( paramsBootstrapped ) {
				options = { location: 'replace' };
			}

			var stateParams = _.pick( this, [ 'period', 'resource', 'resourceId' ] );
			stateParams.metricKey = this.metric.key;

			$state.go(
				'dashboard.analytics.view',
				stateParams,
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
			this.endTime = (new Date( year, month + 1, 1 )).getTime() - 1;

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
		'analyticsCtrl.metric.key',
	] ),
	function()
	{
		if ( _this.period && _this.resource && _this.resourceId && _this.metric ) {
			_this._reportChanged( _this.metric );
		}
	} );

	this.histograms = function()
	{
		return SiteAnalytics.getHistogram( _this.resource, _this.resourceId, this.availableMetrics, [ this.startTime, this.endTime ] )
			.then( function( data )
			{
				angular.extend( _this, data );
			} );
	};

	this.counts = function()
	{
		return SiteAnalytics.getCount( _this.resource, _this.resourceId, this.availableMetrics )
			.then( function( data )
			{
				angular.extend( _this, data );
			} );
	};

	this.getReport = function( title )
	{
		var rows = [];
		for ( var i = 1; i < arguments.length; ++i ) {
			rows.push( arguments[ i ] );
		}

		var report = SiteAnalytics.getReport( title, rows, {
			resource: this.resource,
			resourceId: this.resourceId,
			metric: this.metric,
			startTime: this.startTime,
			endTime: this.endTime,
		} );

		this.breakdownReports.push( report );
	};

	this._reportChanged = function()
	{
		this.breakdownReports = [];

		// Common report types.
		var TYPE_SOURCE = {
			type: 'top-composition',
			field: 'source',
			fieldLabel: 'Domain',
		};

		var TYPE_REFERRERS = {
			type: 'top-composition',
			field: 'source_url',
			fieldLabel: 'Page',
		};

		var TYPE_COUNTRIES = {
			type: 'top-composition',
			field: 'country',
			fieldLabel: 'Country',
		};

		var TYPE_OS = {
			type: 'top-composition',
			field: 'os',
			fieldLabel: 'OS',
		};

		switch ( this.metric.key ) {
			case 'view': {
				this.getReport( 'Top Sources', TYPE_SOURCE );
				this.getReport( 'Referring Pages', TYPE_REFERRERS );
				this.getReport( 'Countries', TYPE_COUNTRIES );
				break;
			}

			case 'download': {
				this.getReport( 'Operating Systems', TYPE_OS );
				this.getReport( 'Top Sources', TYPE_SOURCE );
				this.getReport( 'Referring Pages', TYPE_REFERRERS );
				this.getReport( 'Countries', TYPE_COUNTRIES );
				break;
			}

			case 'install': {
				this.getReport( 'Operating Systems', TYPE_OS );
				this.getReport( 'Countries', TYPE_COUNTRIES );
				break;
			}

			case 'comment': {
				this.getReport( 'Languages', {
					type: 'top-composition',
					field: 'comment_language',
					fieldLabel: 'Language',
				} );
				break;
			}

			case 'rating': {
				this.getReport( 'Rating Breakdown', {
					type: 'rating-breakdown',
					field: 'rating',
					fieldLabel: 'Rating',
				} );
				break;
			}

			case 'follow': {
				this.getReport( 'Countries', TYPE_COUNTRIES );
				break;
			}

			case 'sale': {
				this.getReport( 'Top Sources', TYPE_SOURCE );
				this.getReport( 'Referring Pages', TYPE_REFERRERS );
				this.getReport( 'Countries', TYPE_COUNTRIES );
				this.getReport( 'Operating Systems', TYPE_OS );
				break;
			}

			case 'revenue': {
				this.getReport( 'Revenue Stats',
					{
						type: 'sum',
						field: 'revenue',
						fieldLabel: 'Total Revenue',
						fieldType: 'currency',
					},
					{
						type: 'average',
						field: 'donation',
						fieldLabel: 'Average Support',
						fieldType: 'currency',
					}
				);
				break;
			}
		}
	};
} );
