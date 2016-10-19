import { Inject, Injectable } from 'ng-metadata/core';

export type ResourceName = 'Game' | 'Game_Package' | 'Game_Release';

export interface Metric
{
	key: string;
	collection: string;
	label: string;
	type: 'number' | 'currency';
	field?: string;
}

/**
 * Metric maps are indexed by the Metric.key field.
 */
export type MetricMap = { [k: string]: Metric };

/**
 * Start timestamp, end timestamp
 */
type DateRange = [ number, number ];

// TODO: Figure this out.
type Analyzer = 'histogram' | 'histogram-sum' | 'count' | 'sum' | 'top-composition' | 'rating-breakdown' | 'sum' | 'average';

/**
 * What gets sent to the server to request analytics.
 * We may send multiple requests in one request body.
 */
export interface Request {
	target: ResourceName;
	target_id: number;
	collection: string;
	analyzer: Analyzer;
	field?: string;
	conditions?: string[];

	// Date info is Optional.
	from_date?: number; // In seconds.
	to_date?: number; // In seconds.
	timezone?: number; // Timezone offset.
};

export interface ReportComponent {
	type: ReportAnalyzer;
	field: string;
	fieldLabel: string;
	fieldType?: 'currency';

	// These are only filled out for report component responses.
	data?: any;
	graph?: any;
	total?: any;
	hasData?: boolean;
};

export type ReportAnalyzer = 'top-composition' | 'rating-breakdown' | 'sum' | 'average';

export const ReportTopSources: ReportComponent[] = [ {
	type: 'top-composition',
	field: 'source',
	fieldLabel: 'Domain',
} ];

export const ReportReferringPages: ReportComponent[] = [ {
	type: 'top-composition',
	field: 'source_url',
	fieldLabel: 'Page',
} ];

export const ReportCountries: ReportComponent[] = [ {
	type: 'top-composition',
	field: 'country',
	fieldLabel: 'Country',
} ];

export const ReportOs: ReportComponent[] = [ {
	type: 'top-composition',
	field: 'os',
	fieldLabel: 'OS',
} ];

export const ReportCommentLanguages: ReportComponent[] = [ {
	type: 'top-composition',
	field: 'comment_language',
	fieldLabel: 'Language',
} ];

export const ReportRatingBreakdown: ReportComponent[] = [ {
	type: 'rating-breakdown',
	field: 'rating',
	fieldLabel: 'Rating',
} ];

export const ReportDevRevenue: ReportComponent[] = [ {
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
} ];

@Injectable()
export class SiteAnalytics
{
	constructor(
		@Inject( 'Api' ) private api: any,
		@Inject( 'Graph' ) private graph: any,
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
	)
	{
		this._metrics = [
			{
				key: 'view',
				collection: 'views',
				label: this.gettextCatalog.getString( 'Views' ),
				type: 'number',
			},
			{
				key: 'download',
				collection: 'downloads',
				label: this.gettextCatalog.getString( 'Downloads' ),
				type: 'number',
			},
			{
				key: 'install',
				collection: 'installs',
				label: this.gettextCatalog.getString( 'Installs' ),
				type: 'number',
			},
			{
				key: 'comment',
				collection: 'comments',
				label: this.gettextCatalog.getString( 'Comments' ),
				type: 'number',
			},
			{
				key: 'rating',
				collection: 'ratings',
				label: this.gettextCatalog.getString( 'Ratings' ),
				type: 'number',
			},
			{
				key: 'follow',
				collection: 'follows',
				label: this.gettextCatalog.getString( 'Follows' ),
				type: 'number',
			},
		];

		this._metrics.push( {
			key: 'sale',
			collection: 'sales',
			label: this.gettextCatalog.getString( 'Sales' ),
			type: 'number',
		} );

		this._metrics.push( {
			key: 'revenue',
			collection: 'sales',
			label: this.gettextCatalog.getString( 'Revenue' ),
			type: 'currency',
			field: 'revenue',
		} );
	}

	private _metrics: Metric[];
	private _allMetrics: MetricMap;
	private _packageMetrics: MetricMap;

	get allMetrics()
	{
		if ( !this._allMetrics ) {
			this._allMetrics = _.indexBy( this._metrics, 'key' );
		}

		return this._allMetrics;
	}

	// Currently all metrics work for games.
	get gameMetrics()
	{
		return this.allMetrics;
	}

	get packageMetrics()
	{
		if ( !this._packageMetrics ) {
			this._packageMetrics = <MetricMap>_.pick( this.allMetrics, 'download' );
		}

		return this._packageMetrics;
	}

	// Current release metrics are the same as package metrics.
	get releaseMetrics()
	{
		return this.packageMetrics;
	}

	getHistogram( resource: ResourceName, resourceId: number, metrics: MetricMap, dates: DateRange )
	{
		const request = this.generateAggregationRequest( resource, resourceId, metrics, 'histogram', dates );

		return this.api.sendRequest( '/web/dash/analytics/display', request, { sanitizeComplexData: false } )
			.then( ( response: any ) =>
			{
				let data: any = {};
				angular.forEach( response, ( eventData, metricKey ) =>
				{
					let label: string | undefined = undefined;
					if ( request[ metricKey ].analyzer == 'histogram-sum' ) {
						label = request[ metricKey ].collection;
						label = label.charAt( 0 ).toUpperCase() + label.slice( 1 );
					}
					data[ metricKey ] = this.graph.createGraphData( eventData.result, label );
					data[ metricKey ].total = label ? data[ metricKey ].colTotals[ label ] : eventData.total;
				} );
				return data;
			} );
	}

	getCount( resource: ResourceName, resourceId: number, metrics: MetricMap, dates?: DateRange )
	{
		const request = this.generateAggregationRequest( resource, resourceId, metrics, 'count', dates );

		return this.api.sendRequest( '/web/dash/analytics/display', request, { sanitizeComplexData: false } )
			.then( ( response: any ) =>
			{
				let data: any = {};
				angular.forEach( response, ( eventData, metricKey ) =>
				{
					let amount = eventData.total;
					if ( request[ metricKey ].analyzer == 'sum' ) {
						amount = eventData.result;
					}

					data[ metricKey ] = {
						total: amount,
					};
				} );
				return data;
			} );
	}

	/**
	 * Generate count/histogram requests.
	 */
	private generateAggregationRequest( resource: ResourceName, resourceId: number, metrics: MetricMap, analyzer: Analyzer, dates?: DateRange )
	{
		let request: { [k: string]: Request } = {};

		angular.forEach( metrics, ( metric ) =>
		{
			let _analyzer = analyzer;

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
				const date = new Date();
				request[ metric.key ].from_date = dates[0] / 1000;
				request[ metric.key ].to_date = dates[1] / 1000;
				request[ metric.key ].timezone = date.getTimezoneOffset();
			}
		} );

		return request;
	}
}
