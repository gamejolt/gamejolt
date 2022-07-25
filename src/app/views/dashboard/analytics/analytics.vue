<script lang="ts">
import { reactive } from 'vue';
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import AppExpand from '../../../../_common/expand/AppExpand.vue';
import { formatCurrency } from '../../../../_common/filters/currency';
import { formatDate } from '../../../../_common/filters/date';
import { formatNumber } from '../../../../_common/filters/number';
import { Game } from '../../../../_common/game/game.model';
import { GamePackage } from '../../../../_common/game/package/package.model';
import { GameRelease } from '../../../../_common/game/release/release.model';
import AppGraph from '../../../../_common/graph/graph.vue';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import { BaseRouteComponent, OptionsForRoute } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollAffix from '../../../../_common/scroll/AppScrollAffix.vue';
import { vAppScrollTo } from '../../../../_common/scroll/to/to.directive';
import { useCommonStore } from '../../../../_common/store/common-store';
import { User } from '../../../../_common/user/user.model';
import AppPageHeaderControls from '../../../components/page-header/controls/controls.vue';
import AppPageHeader from '../../../components/page-header/page-header.vue';
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
import AppAnalyticsReportRatingBreakdown from './_report/rating-breakdown.vue';
import AppAnalyticsReportSimpleStat from './_report/simple-stat.vue';
import {
	default as AppAnalyticsReportTopComposition,
	default as AppAnalyticsReportTopCompositionValue,
} from './_report/top-composition.vue';

@Options({
	name: 'RouteDashAnalytics',
	components: {
		AppPageHeader,
		AppPageHeaderControls,
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
		AppScrollTo: vAppScrollTo,
	},
})
@OptionsForRoute({
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
	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

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
	readonly formatNumber = formatNumber;
	readonly formatCurrency = formatCurrency;
	readonly formatDate = formatDate;

	get routeTitle() {
		return this.$gettext('Analytics');
	}

	routeResolved($payload: any) {
		this.resource = this.$route.params.resource as ResourceName;
		this.resourceId = parseInt(this.$route.params.resourceId, 10);

		const appUser = this.app.user!;
		if (this.$route.query.viewAs) {
			this.viewAs = parseInt(this.$route.query.viewAs as string, 10);
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
			!!parseInt(this.$route.query.partner as string, 10);

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
				year = parseInt(this.$route.query['year'] as string, 10);
				month = parseInt(this.$route.query['month'] as string, 10);
			}

			this.startTime = new Date(year, month, 1).getTime();
			this.endTime = new Date(year, month + 1, 1).getTime() - 1;

			this.prevMonth = new Date(year, month - 1, 1).getMonth();
			this.prevYear = new Date(year, month - 1, 1).getFullYear();

			this.nextMonth = new Date(year, month + 1, 1).getMonth();
			this.nextYear = new Date(year, month + 1, 1).getFullYear();
		}

		if (this.period === 'all') {
			this.counts();
		} else if (this.period === 'monthly') {
			this.histograms();
		}

		if (this.period && this.metric) {
			this.metricChanged();
		}
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
			this.metricData[i] = data[i];
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
			this.metricData[i] = data[i];
		}
	}

	pullReport(title: string, ...components: ReportComponent[]) {
		const report = reactive(new SiteAnalyticsReport(title, components)) as SiteAnalyticsReport;

		report.init(
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
</script>

<template>
	<div v-if="isRouteBootstrapped" class="route-analytics">
		<AppPageHeader>
			<nav class="breadcrumb">
				<ul>
					<li>
						<router-link
							:to="{
								name: 'dash.analytics',
								params: { resource: 'User', resourceId: user.id },
								query: $route.query,
							}"
							replace
							active-class="active"
						>
							<AppTranslate class="breadcrumb-tag" translate>User</AppTranslate>
							@{{ user.username }}
						</router-link>
						<AppJolticon
							v-if="game"
							icon="chevron-right"
							class="breadcrumb-separator"
						/>
					</li>
					<li v-if="game">
						<router-link
							:to="{
								name: 'dash.analytics',
								params: { resource: 'Game', resourceId: game.id },
								query: $route.query,
							}"
							replace
							active-class="active"
						>
							<AppTranslate class="breadcrumb-tag">Game</AppTranslate>
							{{ game.title }}
						</router-link>
						<AppJolticon
							v-if="package"
							icon="chevron-right"
							class="breadcrumb-separator"
						/>
					</li>
					<li v-if="package">
						<router-link
							:to="{
								name: 'dash.analytics',
								params: { resource: 'Game_Package', resourceId: package.id },
								query: $route.query,
							}"
							replace
							active-class="active"
						>
							<AppTranslate class="breadcrumb-tag" translate>Package</AppTranslate>
							{{ package.title || game.title }}
						</router-link>
						<AppJolticon
							v-if="release"
							icon="chevron-right"
							class="breadcrumb-separator"
						/>
					</li>
					<li v-if="release">
						<router-link
							:to="{
								name: 'dash.analytics',
								params: { resource: 'Game_Release', resourceId: release.id },
								query: $route.query,
							}"
							replace
							active-class="active"
						>
							<AppTranslate class="breadcrumb-tag">Release</AppTranslate>
							{{ release.version_number }}
						</router-link>
					</li>
				</ul>
			</nav>

			<template #nav>
				<nav class="platform-list inline">
					<ul>
						<li>
							<router-link
								:to="{
									name: 'dash.analytics',
									params: $route.params,
									query: {
										period: 'all',
										partner: $route.query.partner,
									},
								}"
								replace
								:class="{ active: period === 'all' }"
								translate
							>
								All-Time
							</router-link>
						</li>
						<li>
							<router-link
								:to="{
									name: 'dash.analytics',
									params: $route.params,
									query: {
										period: 'monthly',
										partner: $route.query.partner,
									},
								}"
								replace
								:class="{ active: period === 'monthly' }"
								translate
							>
								Monthly
							</router-link>
						</li>
					</ul>
				</nav>
			</template>

			<template v-if="period === 'monthly'" #controls>
				<AppPageHeaderControls>
					<template #start>
						<AppButton
							circle
							trans
							icon="chevron-left"
							:to="{
								name: 'dash.analytics',
								params: $route.params,
								query: {
									period: 'monthly',
									year: prevYear,
									month: prevMonth,
									partner: $route.query.partner,
								},
							}"
							replace
						/>
					</template>

					<div class="text-center">
						<strong>
							{{ formatDate(startTime, 'LLLL yyyy') }}
						</strong>
					</div>

					<template v-if="now > endTime" #end>
						<AppButton
							circle
							trans
							icon="chevron-right"
							:to="{
								name: 'dash.analytics',
								params: $route.params,
								query: {
									period: 'monthly',
									year: nextYear,
									month: nextMonth,
									partner: $route.query.partner,
								},
							}"
							replace
						/>
					</template>
				</AppPageHeaderControls>
			</template>
		</AppPageHeader>

		<template v-if="metricData[metric.key]">
			<AppExpand :when="period === 'monthly' && !!metricData[metric.key].graph">
				<AppGraph :dataset="metricData[metric.key].graph" />
			</AppExpand>

			<section class="section section-thin">
				<div class="container">
					<div class="row">
						<div
							v-for="metric of availableMetrics"
							:key="metric.key"
							class="col-sm-4 col-md-3"
						>
							<router-link
								class="stat-graph-overlay"
								:to="{
									name: 'dash.analytics',
									params: { metricKey: metric.key },
									query: $route.query,
								}"
								replace
								active-class="active"
							>
								<div class="stat-big">
									<div class="stat-big-label">
										{{ metric.label }}
									</div>
									<div class="stat-big-digit">
										<template v-if="metric.type === 'number'">
											{{ formatNumber(metricData[metric.key].total) }}
										</template>
										<template v-else-if="metric.type === 'currency'">
											{{ formatCurrency(metricData[metric.key].total) }}
										</template>
									</div>
								</div>

								<AppGraph
									v-if="period === 'monthly' && metricData[metric.key]"
									:dataset="metricData[metric.key].graph"
									background-variant
								/>
							</router-link>
						</div>
					</div>
				</div>
			</section>

			<template v-if="pageReports.length">
				<hr />

				<section class="section">
					<div class="container">
						<div class="row">
							<div v-if="Screen.isDesktop" class="col-md-3">
								<AppScrollAffix>
									<nav class="platform-list">
										<ul>
											<li
												v-for="(report, i) of pageReports"
												:key="i"
												class="no-animate-leave"
											>
												<a v-app-scroll-to :href="`#report-${i}`">
													{{ report.title }}
												</a>
											</li>
										</ul>
									</nav>
								</AppScrollAffix>
							</div>
							<div class="col-md-9">
								<div
									v-for="(report, i) of pageReports"
									:id="`report-${i}`"
									:key="i"
								>
									<h2 :class="{ 'section-header': i === 0 }">
										{{ report.title }}
									</h2>

									<AppLoading v-if="!report.isLoaded" />

									<div v-if="report.isLoaded" class="row">
										<div v-for="(component, n) of report.components" :key="n">
											<AppAnalyticsReportSimpleStat
												v-if="
													component.type === 'sum' ||
													component.type === 'average'
												"
												:report-data="component"
											/>
											<AppAnalyticsReportTopComposition
												v-else-if="component.type === 'top-composition'"
												:report-data="component"
											/>
											<AppAnalyticsReportTopCompositionValue
												v-else-if="
													component.type === 'top-composition-sum' ||
													component.type === 'top-composition-avg'
												"
												:report-data="component"
											/>
											<AppAnalyticsReportRatingBreakdown
												v-else-if="component.type === 'rating-breakdown'"
												:report-data="component"
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
			</template>
		</template>
	</div>
</template>
