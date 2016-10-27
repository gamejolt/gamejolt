import { Injectable } from 'ng-metadata/core';
import { ReportComponent, Request, ResourceName, Analyzer, Collection, Field, Condition, FetchField, ResourceFields } from './site-analytics-service';

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

	constructor( public title: string, public components: ReportComponent[], resource: ResourceName, resourceId: number, collection: Collection, startTime: number | undefined, endTime: number | undefined )
	{
		const promises = this.components.map( ( component ) =>
		{
			let analyzer = component.type;
			if ( analyzer == 'rating-breakdown' ) {
				analyzer = 'top-composition';
			}

			let conditions: Condition[] | undefined;
			if ( component.field == 'source_url' ) {
				conditions = [ 'source-external' ];
			}

			return this.sendComponentRequest( resource, resourceId, collection, analyzer, component.field, conditions, component.fetchFields, component.resourceFields, startTime, endTime );
		} );

		SiteAnalyticsReport.$q.all( promises )
			.then( ( componentResponses: any ) =>
			{
				this.isLoaded = true;

				this.components.forEach( ( component, i ) =>
				{
					let response = this.processComponentResponse( component, componentResponses[ i ].data, componentResponses[ i ].gathers );

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

	private sendComponentRequest( resource: ResourceName, resourceId: number, collection: Collection, analyzer: Analyzer, field: Field, conditions: Condition[] | undefined, fetchFields: FetchField[] | undefined, resourceFields: ResourceFields | undefined, startTime: number | undefined, endTime: number | undefined )
	{
		const request: Request = {
			target: resource,
			target_id: resourceId,
			collection: collection,
			analyzer: analyzer,
			field: field,
		};

		if ( conditions ) {
			request.conditions = conditions;
		}

		if ( fetchFields ) {
			request.fetch_fields = fetchFields;
		}

		if ( resourceFields ) {
			// Resource fields has different string union types as values, and typescript can't infer it as a merged string union yet.
			const a: any = _.flatten( _.values( resourceFields ) );
			request.resource_fields = a;
		}

		if ( startTime && endTime ) {
			const date = new Date();
			request.from_date = startTime / 1000;
			request.to_date = endTime / 1000;
			request.timezone = date.getTimezoneOffset();
		}

		return SiteAnalyticsReport.Api.sendRequest( '/web/dash/analytics/display', { data: request }, { sanitizeComplexData: false } );
	}

	private processComponentResponse( component: ReportComponent, _response: any, gathers?: any )
	{
		const field = component.field, analyzer = component.type, displayField = component.displayField;

		let response: any = angular.copy( _response );
		let graph: any = null;
		let data: any = {};

		// We return "simple" single value analyzations as is.
		if ( analyzer == 'sum' || analyzer == 'average' ) {
			return response;
		}

		// For top compositions we convert the { key: value } to [ { label: key, value: value } ]
		if ( analyzer == 'top-composition' || analyzer == 'top-composition-sum' || analyzer == 'top-composition-avg' ) {
			// Rating is a special case of top composition. We want to keep processing it as { key: value } and not convert it.
			if ( field != 'rating' ) {
				data = [];
				angular.forEach( response.result, ( val, key ) =>
				{
					switch ( analyzer ) {
						case 'top-composition-sum':
							val = val.sum;
							break;

						case 'top-composition-avg':
							val = val.avg;
							break;
					}

					data.push( {
						label: key,
						value: val,
					} );
				} );
				response.result = data;
			}
			else {
				// Make sure all the rating values are filled in, and in the correct order
				data = {};
				[ 1, 2, 3, 4, 5 ].forEach( ( rating ) =>
				{
					data[ rating ] = response.result[ rating ] || 0;
				} );
				response.result = data;
			}

			// Top composition fields may refer to gathered fields. In this case replace them in now.
			if ( gathers && displayField ) {
				for ( let dataEntry of response.result ) {
					const resourceInfo: string[] = dataEntry.label.split('-');
					const resourceName = resourceInfo[0], resourceId = parseInt( resourceInfo[1] );
					dataEntry.label = {
						resource: resourceName[0].toUpperCase() + resourceName.substr( 1 ),
						resourceId: resourceId,
						value: gathers[resourceName][resourceId][displayField],
					};
				}
			}

			// country code => country name
			if ( field == 'country' ) {
				angular.forEach( response.result, ( val ) =>
				{
					if ( val.label == 'other' ) {
						val.label = SiteAnalyticsReport.gettextCatalog.getString( 'Unknown' );
					}
					else {
						val.label = SiteAnalyticsReport.Geo.getCountryName( val.label ) || val.label;
					}
				} );
			}

			// All fields except 'rating' and 'source_url' expect to also display the graph (doughnut piechart)
			if ( field != 'rating' && field != 'source_url' ) {
				graph = [];
				for ( let i = 0; i < Math.min( response.result.length, 3 ); i++ ) {
					const dataEntry = response.result[i];
					graph.push( {
						label: typeof dataEntry.label == 'object' ? dataEntry.label.value : dataEntry.label,
						value: dataEntry.value,
					} );
				}
				response.graph = graph;
			}
		}

		return response;
	}
}
