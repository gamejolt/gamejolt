angular.module( 'App.SiteAnalytics' ).service( 'SiteAnalytics', function( Api, Graph )
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
				request[ eventType ]['from_date'] = dates[0] / 1000;
				request[ eventType ]['to_date'] = dates[1] / 1000;
				request[ eventType ]['timezone'] = date.getTimezoneOffset();
			}
		} );

		return request;
	}

	this.getHistogram = function( resource, resourceId, eventTypes, dates )
	{
		var request = _generateRequestData( resource, resourceId, eventTypes, 'histogram', dates );

		return Api.sendRequest( '/web/dash/reports/display', request, { detach: true, sanitizeComplexData: false } )
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

		return Api.sendRequest( '/web/dash/reports/display', request, { detach: true, sanitizeComplexData: false } )
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
} );
