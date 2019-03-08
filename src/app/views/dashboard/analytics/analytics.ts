import View from '!view!./analytics.html';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { AppExpand } from '../../../../lib/gj-lib-client/components/expand/expand';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { GamePackage } from '../../../../lib/gj-lib-client/components/game/package/package.model';
import { GameRelease } from '../../../../lib/gj-lib-client/components/game/release/release.model';
import { AppGraph } from '../../../../lib/gj-lib-client/components/graph/graph';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../lib/gj-lib-client/components/route/route-component';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppScrollAffix } from '../../../../lib/gj-lib-client/components/scroll/affix/affix';
import { AppScrollTo } from '../../../../lib/gj-lib-client/components/scroll/to/to.directive';
import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppLoading } from '../../../../lib/gj-lib-client/vue/components/loading/loading';
import { currency } from '../../../../lib/gj-lib-client/vue/filters/currency';
import { date as dateFilter } from '../../../../lib/gj-lib-client/vue/filters/date';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { AppPageHeaderControls } from '../../../components/page-header/controls/controls';
import { AppPageHeader } from '../../../components/page-header/page-header';
import { SiteAnalyticsReport } from '../../../components/site-analytics/report-service';
import {
	Metric,
	MetricMap,
	ReportCommentLanguages,
	ReportComponent,
	ReportCountries,
	ReportDevRevenue,
	ReportOs,
	ReportPartnerGeneratedRevenue,
	ReportPartnerRevenue,
	ReportRatingBreakdown,
	ReportReferringPages,
	ReportTopGamePartnerRevenue,
	ReportTopGameRevenue,
	ReportTopGames,
	ReportTopPartnerRevenue,
	ReportTopPartners,
	ReportTopSources,
	ResourceName,
	SiteAnalytics,
} from '../../../components/site-analytics/site-analytics-service';
import { Store } from '../../../store/index';
import { AppAnalyticsReportRatingBreakdown } from './_report/rating-breakdown';
import { AppAnalyticsReportSimpleStat } from './_report/simple-stat';
import { AppAnalyticsReportTopComposition } from './_report/top-composition';
import { AppAnalyticsReportTopCompositionValue } from './_report/top-composition-value';

@View
@Component({
	name: 'RouteDashAnalytics',
	components: {
		AppPageHeader,
		AppPageHeaderControls,
		AppJolticon,
		AppExpand,
		AppScrollAffix,
		AppLoading,
		AppGraph,
		AppAnalyticsReportSimpleStat,
		AppAnalyticsReportRatingBreakdown,
		AppAnalyticsReportTopComposition,
		AppAnalyticsReportTopCompositionValue,
	},
	directives: {
		AppScrollTo,
	},
	filters: {
		number,
		currency,
		date: dateFilter,
	},
})
@RouteResolver({
	cache: false,
	deps: {
		params: ['resource', 'resourceId', 'metricKey'],
		query: ['viewAs', 'partner', 'period', 'year', 'month'],
	},
	resolver: ({ route }) =>
		Api.sendRequest(
			'/web/dash/analytics/' + route.params.resource + '/' + route.params.resourceId
		),
})
export default class RouteDashAnalytics extends BaseRouteComponent {
	@State
	app!: Store['app'];

	user: User | null = null;
	game: Game | null = null;
	package: GamePackage | null = null;
	release: GameRelease | null = null;

	pageReports: SiteAnalyticsReport[] = [];

	period: 'all' | 'monthly' = 'monthly';
	resource: ResourceName = null as any;
	resourceId = 0;
	partnerMode = false;
	viewAs = 0;
	availableMetrics: MetricMap = {};
	metric: Metric = null as any;
	metricData: any = {};

	now = 0;
	startTime = 0;
	endTime = 0;
	prevMonth = 0;
	prevYear = 0;
	nextMonth = 0;
	nextYear = 0;

	readonly Screen = Screen;

	get routeTitle() {
		return this.$gettext('Analytics');
	}

	routeResolved($payload: any) {
		this.resource = this.$route.params.resource as ResourceName;
		this.resourceId = parseInt(this.$route.params.resourceId, 10);

		const appUser = this.app.user!;
		if (this.$route.query.viewAs) {
			this.viewAs = parseInt(this.$route.query.viewAs, 10);
		}

		if (!this.viewAs) {
			this.viewAs = appUser.id;
		}

		this.user = $payload.user ? new User($payload.user) : null;
		this.game = $payload.game ? new Game($payload.game) : null;
		this.package = $payload.package ? new GamePackage($payload.package) : null;
		this.release = $payload.release ? new GameRelease($payload.release) : null;
		this.partnerMode =
			(!this.user || this.user.id !== this.viewAs) &&
			!!parseInt(this.$route.query.partner, 10);

		this.period = (this.$route.query['period'] as any) || 'monthly';
		this.resource = this.$route.params['resource'] as any;
		this.resourceId = parseInt(this.$route.params['resourceId'], 10);

		switch (this.resource) {
			case 'User':
				this.availableMetrics = SiteAnalytics.userMetrics;
				this.metric = this.availableMetrics[this.$route.params['metricKey'] || 'view'];
				break;

			case 'Game':
				this.availableMetrics = SiteAnalytics.gameMetrics;
				this.metric = this.availableMetrics[this.$route.params['metricKey'] || 'view'];
				break;

			case 'Game_Package':
				if (this.partnerMode) {
					throw new Error('Invalid resource.');
				}
				this.availableMetrics = SiteAnalytics.packageMetrics;
				this.metric = this.availableMetrics[this.$route.params['metricKey'] || 'download'];
				break;

			case 'Game_Release':
				if (this.partnerMode) {
					throw new Error('Invalid resource.');
				}
				this.availableMetrics = SiteAnalytics.releaseMetrics;
				this.metric = this.availableMetrics[this.$route.params['metricKey'] || 'download'];
				break;

			default:
				throw new Error('Invalid resource.');
		}

		if (this.partnerMode) {
			this.availableMetrics = SiteAnalytics.pickPartnerMetrics(this.availableMetrics);
		}

		this.now = Date.now();
		this.startTime = 0;
		this.endTime = 0;

		this.prevMonth = 0;
		this.prevYear = 0;

		this.nextMonth = 0;
		this.nextYear = 0;
		if (this.period === 'monthly') {
			const date = new Date();
			let year: number, month: number;
			if (
				typeof this.$route.query['year'] === 'undefined' ||
				typeof this.$route.query['month'] === 'undefined'
			) {
				year = date.getFullYear();
				month = date.getMonth();
			} else {
				year = parseInt(this.$route.query['year'], 10);
				month = parseInt(this.$route.query['month'], 10);
			}

			this.startTime = new Date(year, month, 1).getTime();
			this.endTime = new Date(year, month + 1, 1).getTime() - 1;

			this.prevMonth = new Date(year, month - 1, 1).getMonth();
			this.prevYear = new Date(year, month - 1, 1).getFullYear();

			this.nextMonth = new Date(year, month + 1, 1).getMonth();
			this.nextYear = new Date(year, month + 1, 1).getFullYear();
		}

		// Temporarily disable fetching analytics
		// if (this.period === 'all') {
		// 	this.counts();
		// } else if (this.period === 'monthly') {
		// 	this.histograms();
		// }

		// if (this.period && this.metric) {
		// 	this.metricChanged();
		// }
	}

	async histograms() {
		if (!this.startTime || !this.endTime) {
			throw new Error('Dates required to get histograms.');
		}

		const data = await SiteAnalytics.getHistogram(
			this.resource,
			this.resourceId,
			this.availableMetrics,
			this.partnerMode,
			this.viewAs,
			[this.startTime, this.endTime]
		);

		for (const i in data) {
			this.$set(this.metricData, i, data[i]);
		}
	}

	async counts() {
		const data = await SiteAnalytics.getCount(
			this.resource,
			this.resourceId,
			this.availableMetrics,
			this.partnerMode,
			this.viewAs
		);

		for (const i in data) {
			this.$set(this.metricData, i, data[i]);
		}
	}

	pullReport(title: string, ...components: ReportComponent[]) {
		const report = new SiteAnalyticsReport(
			title,
			components,
			this.resource,
			this.resourceId,
			this.metric.collection,
			this.partnerMode,
			this.viewAs,
			this.startTime,
			this.endTime
		);

		this.pageReports.push(report);
	}

	private metricChanged() {
		this.pageReports = [];

		if (this.resource !== 'User') {
			switch (this.metric.key) {
				case 'view':
					this.pullReport(this.$gettext('Top Sources'), ...ReportTopSources);
					this.pullReport(this.$gettext('Referring Pages'), ...ReportReferringPages);
					this.pullReport(this.$gettext('Countries'), ...ReportCountries);
					if (!this.partnerMode) {
						this.pullReport(this.$gettext('Partners'), ...ReportTopPartners);
					}
					break;

				case 'download':
					this.pullReport(this.$gettext('Operating Systems'), ...ReportOs);
					this.pullReport(this.$gettext('Top Sources'), ...ReportTopSources);
					this.pullReport(this.$gettext('Referring Pages'), ...ReportReferringPages);
					this.pullReport(this.$gettext('Countries'), ...ReportCountries);
					if (!this.partnerMode) {
						this.pullReport(this.$gettext('Partners'), ...ReportTopPartners);
					}
					break;

				case 'install':
					this.pullReport(this.$gettext('Operating Systems'), ...ReportOs);
					this.pullReport(this.$gettext('Countries'), ...ReportCountries);
					break;

				case 'comment':
					this.pullReport(this.$gettext('Languages'), ...ReportCommentLanguages);
					break;

				case 'rating':
					this.pullReport(this.$gettext('Rating Breakdown'), ...ReportRatingBreakdown);
					break;

				case 'follow':
					this.pullReport(this.$gettext('Countries'), ...ReportCountries);
					break;

				case 'sale':
					this.pullReport(this.$gettext('Top Sources'), ...ReportTopSources);
					this.pullReport(this.$gettext('Referring Pages'), ...ReportReferringPages);
					this.pullReport(this.$gettext('Countries'), ...ReportCountries);
					this.pullReport(this.$gettext('Operating Systems'), ...ReportOs);
					if (!this.partnerMode) {
						this.pullReport(this.$gettext('Partners'), ...ReportTopPartners);
					}
					break;

				case 'revenue':
					if (!this.partnerMode) {
						this.pullReport(this.$gettext('Revenue Stats'), ...ReportDevRevenue);
						this.pullReport(
							this.$gettext('Revenue from Partners'),
							...ReportPartnerGeneratedRevenue
						);
						this.pullReport(
							this.$gettext('Top Profitable Partners'),
							...ReportTopPartnerRevenue
						);
					} else {
						this.pullReport(this.$gettext('Revenue Stats'), ...ReportPartnerRevenue);
					}
					break;
			}
		} else {
			switch (this.metric.key) {
				case 'view':
					this.pullReport(this.$gettext('Top Games'), ...ReportTopGames);
					this.pullReport(this.$gettext('Top Sources'), ...ReportTopSources);
					this.pullReport(this.$gettext('Countries'), ...ReportCountries);
					if (!this.partnerMode) {
						this.pullReport(this.$gettext('Partners'), ...ReportTopPartners);
					}
					break;

				case 'download':
					this.pullReport(this.$gettext('Top Games'), ...ReportTopGames);
					this.pullReport(this.$gettext('Operating Systems'), ...ReportOs);
					this.pullReport(this.$gettext('Top Sources'), ...ReportTopSources);
					this.pullReport(this.$gettext('Countries'), ...ReportCountries);
					if (!this.partnerMode) {
						this.pullReport(this.$gettext('Partners'), ...ReportTopPartners);
					}
					break;

				case 'install':
					this.pullReport(this.$gettext('Top Games'), ...ReportTopGames);
					this.pullReport(this.$gettext('Operating Systems'), ...ReportOs);
					this.pullReport(this.$gettext('Countries'), ...ReportCountries);
					break;

				case 'comment':
					this.pullReport(this.$gettext('Top Games'), ...ReportTopGames);
					this.pullReport(this.$gettext('Languages'), ...ReportCommentLanguages);
					break;

				case 'rating':
					this.pullReport(this.$gettext('Top Games'), ...ReportTopGames);
					this.pullReport(this.$gettext('Rating Breakdown'), ...ReportRatingBreakdown);
					break;

				case 'follow':
					this.pullReport(this.$gettext('Top Games'), ...ReportTopGames);
					this.pullReport(this.$gettext('Countries'), ...ReportCountries);
					break;

				case 'sale':
					this.pullReport(this.$gettext('Top Games'), ...ReportTopGames);
					this.pullReport(this.$gettext('Top Sources'), ...ReportTopSources);
					this.pullReport(this.$gettext('Countries'), ...ReportCountries);
					this.pullReport(this.$gettext('Operating Systems'), ...ReportOs);
					if (!this.partnerMode) {
						this.pullReport(this.$gettext('Partners'), ...ReportTopPartners);
					}
					break;

				case 'revenue':
					if (!this.partnerMode) {
						this.pullReport(this.$gettext('Revenue Stats'), ...ReportDevRevenue);
						this.pullReport(
							this.$gettext('Top Profitable Games'),
							...ReportTopGameRevenue
						);
						this.pullReport(
							this.$gettext('Revenue from Partners'),
							...ReportPartnerGeneratedRevenue
						);
						this.pullReport(
							this.$gettext('Top Profitable Partners'),
							...ReportTopPartnerRevenue
						);
					} else {
						this.pullReport(this.$gettext('Revenue Stats'), ...ReportPartnerRevenue);
						this.pullReport(
							this.$gettext('Top Profitable Games'),
							...ReportTopGamePartnerRevenue
						);
					}
					break;
			}
		}
	}
}
