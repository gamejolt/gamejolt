angular.module( 'App.SiteAnalytics' ).service( 'SiteAnalytics', function( Api, Graph )
{
	this.getHistogram = function( resource, resourceId, eventTypes, dates )
	{
		var request = {};

		eventTypes.forEach( function( eventType )
		{
			request[ eventType ] = {
				target: resource,
				target_id: resourceId,
				collection: eventType + 's',
				analyzer: 'histogram',
				from_date: dates[0] / 1000,
				to_date: dates[1] / 1000,
			};
		} );

		return Api.sendRequest( '/web/dash/developer/games/graphs/display', request, { detach: true, sanitizeComplexData: false } )
			.then( function( response )
			{
				var data = {};
				angular.forEach( response, function( eventData, eventType )
				{
					data[ eventType ] = Graph.createGraphData( eventData.result );
				} );
				return data;
			} );
	};
} );
