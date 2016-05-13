angular.module( 'App.SiteAnalytics' ).service( 'SiteAnalytics', function( $q, Api, Graph, Geo, gettextCatalog )
{
	function _generateRequestData( resource, resourceId, eventTypes, analyzer, dates )
	{
		var request = {};

		eventTypes.forEach( function( eventType )
		{
			request[ eventType ] = {
				target: resource,
				target_id: resourceId,
				collection: eventType + 's',
				analyzer: analyzer,
			};

			if ( dates ) {
				var date = new Date();
				request[ eventType ].from_date = dates[0] / 1000;
				request[ eventType ].to_date = dates[1] / 1000;
				request[ eventType ].timezone = date.getTimezoneOffset();
			}
		} );

		return request;
	}

	this.getHistogram = function( resource, resourceId, eventTypes, dates )
	{
		var request = _generateRequestData( resource, resourceId, eventTypes, 'histogram', dates );

		return Api.sendRequest( '/web/dash/analytics/display', request, { sanitizeComplexData: false } )
			.then( function( response )
			{
				var data = {};
				angular.forEach( response, function( eventData, eventType )
				{
					data[ eventType ] = Graph.createGraphData( eventData.result );
					data[ eventType ].total = eventData.total;
				} );
				return data;
			} );
	};

	this.getCount = function( resource, resourceId, eventTypes, dates )
	{
		var request = _generateRequestData( resource, resourceId, eventTypes, 'count', dates );

		return Api.sendRequest( '/web/dash/analytics/display', request, { sanitizeComplexData: false } )
			.then( function( response )
			{
				var data = {};
				angular.forEach( response, function( eventData, eventType )
				{
					data[ eventType ] = {
						total: eventData.total,
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

				console.log( report );
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
				collection: requestData.eventType + 's',
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
