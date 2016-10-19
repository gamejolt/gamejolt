import { Injectable } from 'ng-metadata/core';
import { ReportComponent, ReportAnalyzer, Request } from './site-analytics-service';

export function ReportFactory( $q: any, Api: any, Geo: any, gettextCatalog: any )
{
	SiteAnalyticsReport.$q = $q;
	SiteAnalyticsReport.Api = Api;
	SiteAnalyticsReport.Geo = Geo;
	SiteAnalyticsReport.gettextCatalog = gettextCatalog;

	return SiteAnalyticsReport;
}

@Injectable()
export class SiteAnalyticsReport
{
	isLoaded = false;

	static $q: ng.IQService;
	static Api: any;
	static Geo: any;
	static gettextCatalog: ng.gettext.gettextCatalog;

	constructor( public title: string, public components: ReportComponent[], requestData: any )
	{
		const promises = this.components.map( ( component ) =>
		{
			let conditions: string[] | undefined;
			if ( component.field == 'source_url' ) {
				conditions = [ 'source-external' ];
			}

			return this.sendComponentRequest( component.type, component.field, requestData, conditions );
		} );

		SiteAnalyticsReport.$q.all( promises )
			.then( ( componentResponses: any ) =>
			{
				this.isLoaded = true;

				this.components.forEach( ( component, i ) =>
				{
					let response = this.processComponentResponse( component.field, componentResponses[ i ].data );

					component.data = response.result;
					component.graph = response.graph;
					component.total = response.total;

					if ( component.type == 'sum' || component.type == 'average' ) {
						component.hasData = angular.isDefined( component.data ) && component.data !== null;
					}
					else {
						component.hasData = component.data && Object.keys( component.data ).length > 0;
					}
				} );
			} );
	}

	private sendComponentRequest( type: ReportAnalyzer, field: string, requestData: any, conditions?: string[] )
	{
		let analyzer = type;
		if ( type == 'rating-breakdown' ) {
			analyzer = 'top-composition';
		}

		let request: { data: Request } = {
			data: {
				target: requestData.resource,
				target_id: requestData.resourceId,
				collection: requestData.metric.collection,
				analyzer: analyzer,
				field: field,
			},
		};

		if ( requestData.startTime && requestData.endTime ) {
			const date = new Date();
			request.data.from_date = requestData.startTime / 1000;
			request.data.to_date = requestData.endTime / 1000;
			request.data.timezone = date.getTimezoneOffset();
		}

		if ( conditions ) {
			request.data.conditions = conditions;
		}

		return SiteAnalyticsReport.Api.sendRequest( '/web/dash/analytics/display', request, { sanitizeComplexData: false } );
	}

	private processComponentResponse( field: string, _response: any )
	{
		let response: any = angular.copy( _response );
		let graph: any = null;
		let data: any = {};

		// country code => country name
		if ( field == 'country' ) {
			data = {};
			angular.forEach( response.result, ( val, key ) =>
			{
				if ( key == 'other' ) {
					data[ SiteAnalyticsReport.gettextCatalog.getString( 'Unknown' ) ] = val;
				}
				else {
					data[ SiteAnalyticsReport.Geo.getCountryName( key ) || key ] = val;
				}
			} );
			response.result = data;
		}

		if ( field != 'rating' && field != 'source_url' ) {

			graph = [];

			// Pull the top 3 results so we can push into a pie chart if desired.
			var i = 0, total = 0;
			angular.forEach( response.result, ( val, key ) =>
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
			[ 1, 2, 3, 4, 5 ].forEach( ( rating ) =>
			{
				data[ rating ] = response.result[ rating ] || 0;
			} );
			response.result = data;
		}

		response.graph = graph;

		return response;
	}
}
