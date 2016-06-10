angular.module( 'App.SiteAnalytics' ).service( 'SiteAnalytics', function( $q, Api, Graph, Geo, gettextCatalog )
{
	function _generateRequestData( resource, resourceId, metrics, analyzer, dates )
	{
		var request = {};

		angular.forEach( metrics, function( metric )
		{
			var _analyzer = analyzer;

			if ( metric.type == 'currency' ) {
				if ( _analyzer == 'histogram' ) {
					_analyzer = 'histogram-sum';
				}
				else if ( _analyzer == 'count' ) {
					_analyzer = 'sum';
				}
			}

			request[ metric.key ] = {
				target: resource,
				target_id: resourceId,
				collection: metric.collection,
				analyzer: _analyzer,
			};

			if ( metric.field ) {
				request[ metric.key ].field = metric.field;
			}

			if ( dates ) {
				var date = new Date();
				request[ metric.key ].from_date = dates[0] / 1000;
				request[ metric.key ].to_date = dates[1] / 1000;
				request[ metric.key ].timezone = date.getTimezoneOffset();
			}
		} );

		return request;
	}

	this.getHistogram = function( resource, resourceId, metrics, dates )
	{
		var request = _generateRequestData( resource, resourceId, metrics, 'histogram', dates );

		return Api.sendRequest( '/web/dash/analytics/display', request, { sanitizeComplexData: false } )
			.then( function( response )
			{
				var data = {};
				angular.forEach( response, function( eventData, metricKey )
				{
					var label = false;
					if ( request[ metricKey ].analyzer == 'histogram-sum' ) {
						label = request[ metricKey ].collection;
						label = label.charAt( 0 ).toUpperCase() + label.slice( 1 );
					}
					console.log( 'Displaying graph for ' + metricKey + ', label ' + label );
					data[ metricKey ] = Graph.createGraphData( eventData.result, label );
					data[ metricKey ].total = label ? data[ metricKey ].colTotals[ label ] : eventData.total;
				} );
				return data;
			} );
	};

	this.getCount = function( resource, resourceId, metrics, dates )
	{
		var request = _generateRequestData( resource, resourceId, metrics, 'count', dates );

		return Api.sendRequest( '/web/dash/analytics/display', request, { sanitizeComplexData: false } )
			.then( function( response )
			{
				var data = {};
				angular.forEach( response, function( eventData, metricKey )
				{
					var amount = eventData.total;
					if ( request[ metricKey ].analyzer == 'sum' ) {
						amount = eventData.result;
					}

					data[ metricKey ] = {
						total: amount,
					};
				} );
				return data;
			} );
	};

	this.getReport = function( title, rows, requestData )
	{
		var report = {
			title: title,
			isLoaded: false,
			rows: rows,
		};

		promises = report.rows.map( function( row )
		{
			var conditions = null;

			if ( row.field == 'source_url' ) {
				conditions = [ 'source-external' ];
			}

			return _sendReportRequest( row.type, row.field, requestData, conditions );
		} );

		$q.all( promises ).then( function( rowResponses )
		{
			report.isLoaded = true;

			report.rows.forEach( function( row, i )
			{
				response = _processReportRequest( row.field, rowResponses[ i ].data );

				row.data = response.result;
				row.graph = response.graph;
				row.total = response.total;

				if ( row.type == 'sum' || row.type == 'average' ) {
					row.hasData = angular.isDefined( row.data ) && row.data !== null;
				}
				else {
					row.hasData = row.data && Object.keys( row.data ).length > 0;
				}
			} );
		} );

		return report;
	};

	function _sendReportRequest( type, field, requestData, conditions )
	{
		var analyzer = type;
		if ( type == 'rating-breakdown' ) {
			analyzer = 'top-composition';
		}

		var request = {
			data: {
				target: requestData.resource,
				target_id: requestData.resourceId,
				collection: requestData.metric.collection,
				analyzer: analyzer,
				field: field,
			},
		};

		if ( requestData.startTime && requestData.endTime ) {
			var date = new Date();
			request.data.from_date = requestData.startTime / 1000;
			request.data.to_date = requestData.endTime / 1000;
			request.data.timezone = date.getTimezoneOffset();
		}

		if ( conditions ) {
			request.data.conditions = conditions;
		}

		return Api.sendRequest( '/web/dash/analytics/display', request, { sanitizeComplexData: false } );
	}

	function _processReportRequest( field, _response )
	{
		var response = angular.copy( _response );
		var graph = null;
		var data = {};

		// country code => country name
		if ( field == 'country' ) {
			data = {};
			angular.forEach( response.result, function( val, key )
			{
				if ( key == 'other' ) {
					data[ gettextCatalog.getString( 'Unknown' ) ] = val;
				}
				else {
					data[ Geo.getCountryName( key ) || key ] = val;
				}
			} );
			response.result = data;
		}

		if ( field != 'rating' && field != 'source_url' ) {

			graph = [];

			// Pull the top 3 results so we can push into a pie chart if desired.
			var i = 0, total = 0;
			angular.forEach( response.result, function( val, key )
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
			data = {};
			[ 1, 2, 3, 4, 5 ].forEach( function( rating )
			{
				data[ rating ] = response.result[ rating ] || 0;
			} );
			response.result = data;
		}

		response.graph = graph;

		return response;
	}
} );
