angular.module( 'App.Views' ).controller( 'Dashboard.ReportsCtrl', function( App, Graph, gettextCatalog, payload )
{
	App.title = gettextCatalog.getString( 'Reports' );

	this.resource = 'Game';
	this.eventType = 'view';
	this.resourceId = 1050;

	this.period = 'monthly';

	this.view = Graph.createGraphData( payload.views );
	this.download = Graph.createGraphData( payload.downloads );

	this.changeReport = function( stat )
	{
		this.eventType = stat.eventType;
	};

	this.test = [
		{ label: 'test1', value : 50 },
		{ label: 'test2', value : 90 },
		{ label: 'test3', value : 75 },
	];

	// series.data.forEach( function( row )
	// {
	// 	if ( i == 0 ) {
	// 		this.data.labels.push( moment( row[0] ).format( 'MMM DD' ) );
	// 	}

	// 	dataset.data.push( row[1] );
	// 	// dataset.data.push( Math.ceil( Math.random() * 100 ) );
	// }, this );

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

	this.stats = [
		{
			eventType: 'view',
			label: 'Views',
			type: 'number',
			value: 345,
		},
		{
			eventType: 'download',
			label: 'Downloads',
			type: 'number',
			value: 56,
		},
		{
			eventType: 'install',
			label: 'Installs',
			type: 'number',
			value: 23,
		},
		{
			eventType: 'comment',
			label: 'Comments',
			type: 'number',
			value: 13,
		},
		{
			eventType: 'rating',
			label: 'Ratings',
			type: 'number',
			value: 8,
		},
		{
			eventType: 'follow',
			label: 'Follows',
			type: 'number',
			value: 23,
		},
		{
			eventType: 'order',
			label: 'Sales',
			type: 'number',
			value: 3,
		},
		{
			// eventType: 'view',
			label: 'Revenue',
			type: 'currency',
			value: 4524,
		},
	];
} );
