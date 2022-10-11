import { computed } from 'vue';
import { arrayIndexBy } from '../../../utils/array';
import { objectPick } from '../../../utils/object';
import { Api } from '../../../_common/api/api.service';
import { Graph } from '../../../_common/graph/graph.service';
import { $gettext } from '../../../_common/translate/translate.service';

export type ResourceName = 'Partner' | 'User' | 'Game' | 'Game_Package' | 'Game_Release';

export type Analyzer =
	| 'count'
	| 'sum'
	| 'average'
	| 'top-composition'
	| 'top-composition-sum'
	| 'top-composition-avg'
	| 'rating-breakdown'
	| 'histogram'
	| 'histogram-sum'
	| 'histogram-avg'
	| 'ordered-asc'
	| 'ordered-desc';

export type Collection =
	| 'views'
	| 'expands'
	| 'downloads'
	| 'installs'
	| 'comments'
	| 'ratings'
	| 'follows'
	| 'sales'
	| 'user-charges'
	| 'user-invites';

export type Condition =
	| 'time'
	| 'source-gamejolt'
	| 'source-external'
	| 'users-only'
	| 'guests-only'
	| 'followers-only'
	| 'promotional-only'
	| 'non-promotional-only'
	| 'has-donations'
	| 'no-donations'
	| 'has-partner'
	| 'no-partner'
	| 'partner';

export type PseudoField =
	| 'partner_generated_revenue' // Translates to revenue field with conditions has partner
	| 'partner_generated_donation'; // Translates to donation field with conditions has partner

export type Field =
	| PseudoField
	| 'country'
	| 'source_url'
	| 'source'
	| 'os'
	| 'comment_language'
	| 'comment_votes'
	| 'comment_replies'
	| 'rating'
	| 'game'
	| 'package'
	| 'is_promotional'
	| 'donation'
	| 'revenue'
	| 'gj_revenue'
	| 'user'
	| 'partner_revenue'
	| 'partner'
	| 'logged_on'
	| 'charge_amount'
	| 'charge_purpose'
	| 'sticker'
	| 'fireside_post'
	| 'fireside'
	| 'creator_supporter'
	| 'invited_user';

export type GameField = 'game_name' | 'game_model';
export type UserField = 'user_display_name' | 'user_username' | 'user_model';
export type PostField = 'post_lead' | 'post_model';
export type FiresideField = 'fireside_title' | 'fireside_model';

export interface ResourceFields {
	game?: GameField[];
	user?: UserField[];
	partner?: UserField[];
	creator_supporter?: UserField[];
	invited_user?: UserField[];
	fireside_post?: PostField[];
	fireside?: FiresideField[];
}

export type MetricKey =
	| 'view'
	| 'download'
	| 'install'
	| 'comment'
	| 'rating'
	| 'follow'
	| 'sale'
	| 'revenue'
	| 'user-charge'
	| 'user-invite';

export interface Metric {
	key: MetricKey;
	collection: Collection;
	label: string;
	type: 'number' | 'currency';
	field?: Field;
}

/**
 * Metric maps are indexed by the Metric.key field.
 */
export type MetricMap = Partial<Record<MetricKey, Metric>>;

/**
 * Start timestamp, end timestamp
 */
type DateRange = [number, number];

/**
 * What gets sent to the server to request analytics.
 * We may send multiple requests in one request body.
 */
export interface Request {
	target: ResourceName;
	target_id: number;
	view_as?: number;
	as_partner?: boolean;
	collection: Collection;
	analyzer: Analyzer;
	field?: Field;
	conditions?: Condition[];
	fetch_fields?: Field[];
	resource_fields?: (GameField | UserField)[];
	size?: number;

	// Date info is Optional.
	from_date?: number; // In seconds.
	to_date?: number; // In seconds.
	timezone?: number; // Timezone offset.
}

export interface ReportComponent {
	type: Analyzer;
	field: Field;
	fieldLabel: string;
	fieldType?: 'currency';
	fetchFields?: Field[];
	resourceFields?: ResourceFields;
	displayField?: Field | GameField | UserField | PostField | FiresideField;
	size?: number;

	// These are only filled out for report component responses.
	data?: any;
	graph?: any;
	total?: any;
	hasData?: boolean;
}

export const ReportTopSources: ReportComponent[] = [
	{
		type: 'top-composition',
		field: 'source',
		fieldLabel: 'Domain',
	},
];

export const ReportReferringPages: ReportComponent[] = [
	{
		type: 'top-composition',
		field: 'source_url',
		fieldLabel: 'Page',
	},
];

export const ReportCountries: ReportComponent[] = [
	{
		type: 'top-composition',
		field: 'country',
		fieldLabel: 'Country',
	},
];

export const ReportOs: ReportComponent[] = [
	{
		type: 'top-composition',
		field: 'os',
		fieldLabel: 'OS',
	},
];

export const ReportCommentLanguages: ReportComponent[] = [
	{
		type: 'top-composition',
		field: 'comment_language',
		fieldLabel: 'Language',
	},
];

export const ReportRatingBreakdown: ReportComponent[] = [
	{
		type: 'rating-breakdown',
		field: 'rating',
		fieldLabel: 'Rating',
	},
];

export const ReportDevRevenue: ReportComponent[] = [
	{
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
	},
];

export const ReportTopGames: ReportComponent[] = [
	{
		type: 'top-composition',
		field: 'game',
		fieldLabel: 'Game',
		resourceFields: {
			game: ['game_name'],
		},
		displayField: 'game_name',
	},
];

export const ReportTopGameRevenue: ReportComponent[] = [
	{
		type: 'top-composition-sum',
		field: 'game',
		fetchFields: ['revenue'],
		resourceFields: {
			game: ['game_name'],
		},
		fieldLabel: 'Revenue by Game',
		fieldType: 'currency',
		displayField: 'game_name',
	},
	{
		type: 'top-composition-avg',
		field: 'game',
		fetchFields: ['donation'],
		resourceFields: {
			game: ['game_name'],
		},
		fieldLabel: 'Average Support by Game',
		fieldType: 'currency',
		displayField: 'game_name',
	},
];
export const ReportTopPartners: ReportComponent[] = [
	{
		type: 'top-composition',
		field: 'partner',
		fieldLabel: 'Partner',
		resourceFields: {
			partner: ['user_display_name'],
		},
		displayField: 'user_display_name',
	},
];

export const ReportPartnerGeneratedRevenue: ReportComponent[] = [
	{
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
	},
];

export const ReportTopPartnerRevenue: ReportComponent[] = [
	{
		type: 'top-composition-sum',
		field: 'partner',
		fetchFields: ['revenue'],
		resourceFields: {
			partner: ['user_display_name'],
		},
		fieldLabel: 'Revenue by Partner',
		fieldType: 'currency',
		displayField: 'user_display_name',
	},
	{
		type: 'top-composition-avg',
		field: 'partner',
		fetchFields: ['donation'],
		resourceFields: {
			partner: ['user_display_name'],
		},
		fieldLabel: 'Average Support by Partner',
		fieldType: 'currency',
		displayField: 'user_display_name',
	},
];

export const ReportTopCreatorSupporters: ReportComponent[] = [
	{
		type: 'top-composition',
		field: 'creator_supporter',
		fieldLabel: 'Supporters',
		resourceFields: {
			creator_supporter: ['user_username', 'user_model'],
		},
		displayField: 'user_username',
	},
];

export const ReportTopChargedPosts: ReportComponent[] = [
	{
		type: 'top-composition',
		field: 'fireside_post',
		fieldLabel: 'Posts',
		resourceFields: {
			fireside_post: ['post_lead', 'post_model'],
		},
		displayField: 'post_lead',
	},
];

export const ReportTopChargedFiresides: ReportComponent[] = [
	{
		type: 'top-composition',
		field: 'fireside',
		fieldLabel: 'Firesides',
		resourceFields: {
			fireside: ['fireside_title'],
		},
		displayField: 'fireside_title',
	},
];

export const ReportInvitedUsers: ReportComponent[] = [
	{
		type: 'ordered-desc',
		field: 'logged_on',
		fieldLabel: 'Invited Users',
		resourceFields: {
			invited_user: ['user_username', 'user_model'],
		},
		fetchFields: ['invited_user'],
		displayField: 'user_username',
		size: 100,
	},
];

export class SiteAnalytics {
	private static _metrics: Metric[] = [
		{
			key: 'view',
			collection: 'views',
			label: $gettext(`Game Page Views`),
			type: 'number',
		},
		{
			key: 'download',
			collection: 'downloads',
			label: $gettext(`Game Downloads`),
			type: 'number',
		},
		{
			key: 'install',
			collection: 'installs',
			label: $gettext(`Game Installs`),
			type: 'number',
		},
		{
			key: 'comment',
			collection: 'comments',
			label: $gettext(`Game Comments`),
			type: 'number',
		},
		{
			key: 'rating',
			collection: 'ratings',
			label: $gettext(`Game Ratings`),
			type: 'number',
		},
		{
			key: 'follow',
			collection: 'follows',
			label: $gettext(`Game Follows`),
			type: 'number',
		},
		{
			key: 'sale',
			collection: 'sales',
			label: $gettext(`Game Sales`),
			type: 'number',
		},
		{
			key: 'revenue',
			collection: 'sales',
			label: $gettext(`Game Revenue`),
			type: 'currency',
			field: 'revenue',
		},
		{
			key: 'user-charge',
			collection: 'user-charges',
			label: $gettext(`Charged Stickers`),
			type: 'number',
			field: 'charge_amount',
		},
		{
			key: 'user-invite',
			collection: 'user-invites',
			label: $gettext(`User Invites`),
			type: 'number',
		},
	];

	static allMetrics = computed((): MetricMap => {
		return arrayIndexBy(this._metrics, 'key');
	});

	static userMetrics = computed((): MetricMap => {
		return objectPick(this.allMetrics.value, ['user-invite']);
	});

	static creatorMetrics = computed((): MetricMap => {
		return objectPick(this.allMetrics.value, ['user-charge']);
	});

	static gameDevMetrics = computed((): MetricMap => {
		return objectPick(this.allMetrics.value, [
			'view',
			'download',
			'install',
			'comment',
			'rating',
			'follow',
			'sale',
			'revenue',
		]);
	});

	static gameMetrics = computed(() => this.gameDevMetrics.value);

	static packageMetrics = computed((): MetricMap => {
		return objectPick(this.allMetrics.value, ['download', 'install', 'sale', 'revenue']);
	});

	static releaseMetrics = computed((): MetricMap => {
		return objectPick(this.allMetrics.value, ['download', 'install']);
	});

	static async getHistogram(
		resource: ResourceName,
		resourceId: number,
		metrics: MetricMap,
		viewAs: number,
		dates: DateRange
	) {
		const request = this.generateAggregationRequest(
			resource,
			resourceId,
			metrics,
			'histogram',
			viewAs,
			dates
		);

		const response = await Api.sendRequest('/web/dash/analytics/display', request, {
			sanitizeComplexData: false,
		});

		const data: any = {};
		Object.entries(response).forEach((kv: any) => {
			const [metricKey, eventData] = kv;
			let label: string | undefined = undefined;
			if (request[metricKey].analyzer === 'histogram-sum') {
				label = 'Sum';
			} else if (request[metricKey].analyzer === 'histogram-avg') {
				label = 'Average';
			}
			data[metricKey] = Graph.createGraphData(eventData.result);
			data[metricKey].total = label ? data[metricKey].colTotals[label] : eventData.total;
		});

		return data;
	}

	static async getCount(
		resource: ResourceName,
		resourceId: number,
		metrics: MetricMap,
		viewAs: number,
		dates?: DateRange
	) {
		const request = this.generateAggregationRequest(
			resource,
			resourceId,
			metrics,
			'count',
			viewAs,
			dates
		);

		const response = await Api.sendRequest('/web/dash/analytics/display', request, {
			sanitizeComplexData: false,
		});

		const data: any = {};
		Object.entries(response).forEach((kv: any) => {
			const [metricKey, eventData] = kv;
			let amount = eventData.total;
			if (request[metricKey].analyzer === 'sum') {
				amount = eventData.result;
			}

			data[metricKey] = {
				total: amount,
			};
		});

		return data;
	}

	/**
	 * Generate count/histogram requests.
	 */
	private static generateAggregationRequest(
		resource: ResourceName,
		resourceId: number,
		metrics: MetricMap,
		analyzer: Analyzer,
		viewAs: number,
		dates?: DateRange
	) {
		const request: { [k: string]: Request } = {};

		Object.values(metrics).forEach(metric => {
			let _analyzer = analyzer;

			if (metric.type === 'currency') {
				if (_analyzer === 'histogram') {
					_analyzer = 'histogram-sum';
				} else if (_analyzer === 'count') {
					_analyzer = 'sum';
				}
			}

			request[metric.key] = {
				target: resource,
				target_id: resourceId,
				collection: metric.collection,
				analyzer: _analyzer,
			};

			if (viewAs) {
				request[metric.key].view_as = viewAs;
			}

			if (metric.field) {
				request[metric.key].field = metric.field;
			}

			if (dates) {
				const date = new Date();
				request[metric.key].from_date = dates[0] / 1000;
				request[metric.key].to_date = dates[1] / 1000;
				request[metric.key].timezone = date.getTimezoneOffset();
			}
		});

		return request;
	}
}
