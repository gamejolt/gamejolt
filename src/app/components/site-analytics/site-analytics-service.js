angular.module( 'App.SiteAnalytics' ).service( 'SiteAnalytics', function( Api, Graph, Geo, gettextCatalog )
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

	this.getReport = function( field, title, fieldLabel, requestData )
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

		var conditions = null;

		if ( field == 'source_url' ) {
			conditions = [ 'source-external' ];
		}

		var request = _sendReportRequest( field, requestData, conditions )
			.then( function( response )
			{
				response = _processReportRequest( field, response.top );

				report.data = response.result;
				report.graph = response.graph;
				report.total = response.total;
				report.isLoaded = true;
				report.hasData = report.data && Object.keys( report.data ).length > 0;
			} );

		return report;
	};

	function _sendReportRequest( field, requestData, conditions )
	{
		var request = {
			top: {
				target: requestData.resource,
				target_id: requestData.resourceId,
				collection: requestData.eventType + 's',
				analyzer: 'top-composition',
				field: field,
			},
		};

		if ( requestData.startTime && requestData.endTime ) {
			var date = new Date();
			request.top.from_date = requestData.startTime / 1000;
			request.top.to_date = requestData.endTime / 1000;
			request.top.timezone = date.getTimezoneOffset();
		}

		if ( conditions ) {
			request.top.conditions = conditions;
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
