import { Inject, Injectable } from 'ng-metadata/core';
import { Api } from '../../../lib/gj-lib-client/components/api/api.service';
import { Graph } from '../../../lib/gj-lib-client/components/graph/graph.service';

export type ResourceName = 'Partner' | 'User' | 'Game' | 'Game_Package' | 'Game_Release';

// TODO: Figure this out.const ORDERED_ASC = 'ordered-asc';
export type Analyzer =
	'count' | 'sum' | 'average' | 'top-composition' | 'top-composition-sum' | 'top-composition-avg' | 'rating-breakdown' |
	'histogram' | 'histogram-sum' | 'histogram-avg' | 'ordered-asc' | 'ordered-desc';

export type Collection =
	'views' | 'expands' | 'downloads' | 'installs' | 'comments' | 'ratings' | 'follows' | 'sales';

export type Condition =
	'time' | 'source-gamejolt' | 'source-external' | 'users-only' | 'guests-only' | 'followers-only' |
	'promotional-only' | 'non-promotional-only' | 'has-donations' | 'no-donations' |
	'has-partner' | 'no-partner' | 'partner';

export type PseudoField =
	'partner_generated_revenue' | // Translates to revenue field with conditions has partner
	'partner_generated_donation'; // Translates to donation field with conditions has partner

export type Field = PseudoField |
	'country' | 'source_url' | 'source' | 'os' | 'comment_language' | 'comment_votes' | 'comment_replies' |
	'rating' | 'game' | 'package' | 'is_promotional' | 'donation' | 'revenue' | 'gj_revenue' |
	'user' | 'partner_revenue' | 'partner' | 'logged_on';

export type GameField = 'game_name';
export type UserField = 'user_display_name';
export interface ResourceFields
{
	game?: GameField[];
	user?: UserField[];
	partner?: UserField[];
}


export type MetricKey =
	'view' | 'download' | 'install' | 'comment' | 'rating' | 'follow' | 'sale' | 'revenue';

export interface Metric
{
	key: MetricKey;
	collection: Collection;
	label: string;
	type: 'number' | 'currency';
	field?: Field;
}

/**
 * Metric maps are indexed by the Metric.key field.
 */
export type MetricMap = { [k: string]: Metric };

/**
 * Start timestamp, end timestamp
 */
type DateRange = [ number, number ];

/**
 * What gets sent to the server to request analytics.
 * We may send multiple requests in one request body.
 */
export interface Request {
	target: ResourceName;
	target_id: number;
	collection: Collection;
	analyzer: Analyzer;
	field?: Field;
	conditions?: Condition[];
	fetch_fields?: Field[];
	resource_fields?: ( GameField | UserField )[];

	// Date info is Optional.
	from_date?: number; // In seconds.
	to_date?: number; // In seconds.
	timezone?: number; // Timezone offset.
};

export interface ReportComponent {
	type: Analyzer;
	field: Field;
	fieldLabel: string;
	fieldType?: 'currency';
	fetchFields?: Field[];
	resourceFields?: ResourceFields;
	displayField?: Field | GameField | UserField;

	// These are only filled out for report component responses.
	data?: any;
	graph?: any;
	total?: any;
	hasData?: boolean;
};

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

export const ReportTopGames: ReportComponent[] = [ {
	type: 'top-composition',
	field: 'game',
	fieldLabel: 'Game',
	resourceFields: {
		game: ['game_name'],
	},
	displayField: 'game_name',
} ];

export const ReportTopGameRevenue: ReportComponent[] = [ {
	type: 'top-composition-sum',
	field: 'game',
	fetchFields: [ 'revenue' ],
	resourceFields: {
		game: ['game_name'],
	},
	fieldLabel: 'Revenue by Game',
	fieldType: 'currency',
	displayField: 'game_name',
}, {
	type: 'top-composition-avg',
	field: 'game',
	fetchFields: [ 'donation' ],
	resourceFields: {
		game: ['game_name'],
	},
	fieldLabel: 'Average Support by Game',
	fieldType: 'currency',
	displayField: 'game_name',
} ];

export const ReportTopGamePartnerRevenue: ReportComponent[] = [ {
	type: 'top-composition-sum',
	field: 'game',
	fetchFields: [ 'partner_revenue' ],
	resourceFields: {
		game: ['game_name'],
	},
	fieldLabel: 'Revenue by Game',
	fieldType: 'currency',
	displayField: 'game_name',
} ];

export const ReportTopPartners: ReportComponent[] = [ {
	type: 'top-composition',
	field: 'partner',
	fieldLabel: 'Partner',
	resourceFields: {
		partner: ['user_display_name'],
	},
	displayField: 'user_display_name',
} ];

export const ReportPartnerGeneratedRevenue: ReportComponent[] = [ {
	type: 'sum',
	field: 'partner_generated_revenue',
	fieldLabel: 'Total Revenue',
	fieldType: 'currency',
},
{
	type: 'average',
	field: 'partner_generated_donation',
	fieldLabel: 'Average Support',
	fieldType: 'currency',
} ];

export const ReportPartnerRevenue: ReportComponent[] = [ {
	type: 'sum',
	field: 'partner_revenue',
	fieldLabel: 'Total Revenue',
	fieldType: 'currency',
} ];

export const ReportTopPartnerRevenue: ReportComponent[] = [ {
	type: 'top-composition-sum',
	field: 'partner',
	fetchFields: [ 'revenue' ],
	resourceFields: {
		partner: ['user_display_name'],
	},
	fieldLabel: 'Revenue by Partner',
	fieldType: 'currency',
	displayField: 'user_display_name',
}, {
	type: 'top-composition-avg',
	field: 'partner',
	fetchFields: [ 'donation' ],
	resourceFields: {
		partner: ['user_display_name'],
	},
	fieldLabel: 'Average Support by Partner',
	fieldType: 'currency',
	displayField: 'user_display_name',
} ];

@Injectable( 'SiteAnalytics' )
export class SiteAnalytics
{
	constructor(
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
			{
				key: 'sale',
				collection: 'sales',
				label: this.gettextCatalog.getString( 'Sales' ),
				type: 'number',
			},
			{
				key: 'revenue',
				collection: 'sales',
				label: this.gettextCatalog.getString( 'Revenue' ),
				type: 'currency',
				field: 'revenue',
			},
		];
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

	// Currently all metrics work for users and games.
	// Changes between the reports loaded is in the analytics controller at time of switching metric.
	get userMetrics()
	{
		return this.allMetrics;
	}

	get gameMetrics()
	{
		return this.allMetrics;
	}

	get packageMetrics()
	{
		if ( !this._packageMetrics ) {
			const possibleMetrics: MetricKey[] = [ 'download' ];
			this._packageMetrics = <MetricMap>_.pick( this.allMetrics, possibleMetrics );
		}

		return this._packageMetrics;
	}

	// Current release metrics are the same as package metrics.
	get releaseMetrics()
	{
		return this.packageMetrics;
	}

	pickPartnerMetrics( metrics: MetricMap )
	{
		const possibleMetrics: MetricKey[] = [ 'view', 'sale', 'revenue' ];
		return <MetricMap>_.pick( metrics, possibleMetrics );
	}

	getHistogram( resource: ResourceName, resourceId: number, metrics: MetricMap, partnerMode: boolean, dates: DateRange )
	{
		const request = this.generateAggregationRequest( resource, resourceId, metrics, 'histogram', partnerMode, dates );

		return Api.sendRequest( '/web/dash/analytics/display', request, { sanitizeComplexData: false } )
			.then( ( response: any ) =>
			{
				let data: any = {};
				angular.forEach( response, ( eventData, metricKey ) =>
				{
					let label: string | undefined = undefined;
					if ( request[ metricKey ].analyzer == 'histogram-sum' ) {
						label = 'Sum';
					}
					else if ( request[ metricKey ].analyzer == 'histogram-avg' ) {
						label = 'Average';
					}
					data[ metricKey ] = Graph.createGraphData( eventData.result );
					data[ metricKey ].total = label ? data[ metricKey ].colTotals[ label ] : eventData.total;
				} );
				return data;
			} );
	}

	getCount( resource: ResourceName, resourceId: number, metrics: MetricMap, partnerMode: boolean, dates?: DateRange )
	{
		const request = this.generateAggregationRequest( resource, resourceId, metrics, 'count', partnerMode, dates );

		return Api.sendRequest( '/web/dash/analytics/display', request, { sanitizeComplexData: false } )
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
	private generateAggregationRequest( resource: ResourceName, resourceId: number, metrics: MetricMap, analyzer: Analyzer, partnerMode: boolean, dates?: DateRange )
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

			if ( partnerMode ) {
				if ( request[ metric.key ].field == 'revenue' ) {
					request[ metric.key ].field = 'partner_revenue';
				}
				request[ metric.key ].conditions = [ 'partner' ];
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
