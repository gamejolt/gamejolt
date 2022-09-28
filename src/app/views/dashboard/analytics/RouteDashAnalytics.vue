<script lang="ts">
import { computed, ComputedRef, onMounted, reactive, Ref, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useResizeObserver } from '../../../../utils/resize-observer';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppExpand from '../../../../_common/expand/AppExpand.vue';
import { formatCurrency } from '../../../../_common/filters/currency';
import { formatDate } from '../../../../_common/filters/date';
import { formatNumber } from '../../../../_common/filters/number';
import { Game } from '../../../../_common/game/game.model';
import { GamePackage } from '../../../../_common/game/package/package.model';
import { GameRelease } from '../../../../_common/game/release/release.model';
import AppGraph from '../../../../_common/graph/AppGraph.vue';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import { vAppScrollWhen } from '../../../../_common/scroll/scroll-when.directive';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import { User } from '../../../../_common/user/user.model';
import AppPageHeaderControls from '../../../components/page-header/controls/controls.vue';
import AppPageHeader from '../../../components/page-header/page-header.vue';
import { SiteAnalyticsReport } from '../../../components/site-analytics/report-service';
import {
Metric,
MetricKey,
MetricMap,
ReportCommentLanguages,
ReportComponent,
ReportCountries,
ReportDevRevenue,
ReportOs,
ReportPartnerGeneratedRevenue,
ReportRatingBreakdown,
ReportReferringPages,
ReportTopCreatorFiresides,
ReportTopCreatorPosts,
ReportTopCreatorSupporters,
ReportTopGameRevenue,
ReportTopGames,
ReportTopPartnerRevenue,
ReportTopPartners,
ReportTopSources,
ResourceName,
SiteAnalytics
} from '../../../components/site-analytics/site-analytics-service';
import AppAnalyticsReportRatingBreakdown from './_report/AppAnalyticsReportRatingBreakdown.vue';
import AppAnalyticsReportSimpleStat from './_report/AppAnalyticsReportSimpleStat.vue';
import AppAnalyticsReportTopComposition from './_report/AppAnalyticsReportTopComposition.vue';

export default {
	...defineAppRouteOptions({
		cache: false,
		deps: {
			params: ['resource', 'resourceId', 'metricKey'],
			query: ['viewAs', 'period', 'year', 'month'],
		},
		resolver: ({ route }) =>
			Api.sendRequest(
				'/web/dash/analytics/' + route.params.resource + '/' + route.params.resourceId
			),
	}),
};
</script>

<script lang="ts" setup>
import AppScrollAffix from '../../../../_common/scroll/AppScrollAffix.vue';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
const { user: appUser } = useCommonStore();
const route = useRoute();

// We want vue to think there's always a user since it's a requirement for this
// route.
const user = ref() as Ref<User>;
const game = ref<Game>();
const gamePackage = ref<GamePackage>();
const release = ref<GameRelease>();

const pageReports = ref<SiteAnalyticsReport[]>([]);

const period = ref<'all' | 'monthly'>('monthly');
const resource = ref<ResourceName>(null as any);
const resourceId = ref(0);
const viewAs = ref(0);
const availableMetrics = ref<MetricMap>({});
const selectedMetric = ref<Metric>(null as any);
const metricData = ref({}) as Ref<any>;

const now = ref(0);
const startTime = ref(0);
const endTime = ref(0);
const prevMonth = ref(0);
const prevYear = ref(0);
const nextMonth = ref(0);
const nextYear = ref(0);

/** For iterating over the metrics available without worrying about undefined values */
const availableMetricsBang = computed(() => availableMetrics.value as Required<MetricMap>);

const metricsElem = ref<HTMLDivElement>();
const metricsHeight = ref('0');
onMounted(() => {
	useResizeObserver({
		target: metricsElem,
		callback(entries) {
			if (!entries.length) {
				return;
			}

			metricsHeight.value = `${entries[0].contentRect.height}px`;
		},
	});
});

const { isBootstrapped } = createAppRoute({
	routeTitle: computed(() => $gettext(`Analytics`)),
	onResolved({ payload }) {
		resource.value = route.params.resource as ResourceName;
		resourceId.value = parseInt(String(route.params.resourceId), 10);

		if (route.query.viewAs) {
			viewAs.value = parseInt(String(route.query.viewAs), 10);
		}

		if (!viewAs.value) {
			viewAs.value = appUser.value!.id;
		}

		user.value = new User(payload.user);
		game.value = payload.game ? new Game(payload.game) : undefined;
		gamePackage.value = payload.package ? new GamePackage(payload.package) : undefined;
		release.value = payload.release ? new GameRelease(payload.release) : undefined;

		period.value = (route.query['period'] as any) || 'monthly';
		resource.value = route.params['resource'] as any;
		resourceId.value = parseInt(String(route.params['resourceId']), 10);

		availableMetrics.value = {};

		const _addMetrics = (newMetrics: ComputedRef<MetricMap>) => {
			availableMetrics.value = {
				...availableMetrics.value,
				...newMetrics.value,
			};
		};

		const _selectMetric = () => {
			const fallback = Object.keys(availableMetrics.value)[0] as MetricKey;
			const metricKey = String(route.params['metricKey']) as MetricKey;

			selectedMetric.value =
				availableMetrics.value[metricKey] || availableMetrics.value[fallback]!;
		};

		switch (resource.value) {
			case 'User':
				if (user.value.is_developer) {
					_addMetrics(SiteAnalytics.gameDevMetrics);
				}

				if (user.value.is_creator) {
					_addMetrics(SiteAnalytics.creatorMetrics);
				}

				_selectMetric();
				break;

			case 'Game':
				_addMetrics(SiteAnalytics.gameMetrics);
				_selectMetric();
				break;

			case 'Game_Package':
				_addMetrics(SiteAnalytics.packageMetrics);
				_selectMetric();
				break;

			case 'Game_Release':
				_addMetrics(SiteAnalytics.releaseMetrics);
				_selectMetric();
				break;

			default:
				throw new Error('Invalid resource.');
		}

		now.value = Date.now();
		startTime.value = 0;
		endTime.value = 0;

		prevMonth.value = 0;
		prevYear.value = 0;

		nextMonth.value = 0;
		nextYear.value = 0;
		if (period.value === 'monthly') {
			const date = new Date();
			let year: number, month: number;
			if (
				typeof route.query['year'] === 'undefined' ||
				typeof route.query['month'] === 'undefined'
			) {
				year = date.getFullYear();
				month = date.getMonth();
			} else {
				year = parseInt(route.query['year'] as string, 10);
				month = parseInt(route.query['month'] as string, 10);
			}

			startTime.value = new Date(year, month, 1).getTime();
			endTime.value = new Date(year, month + 1, 1).getTime() - 1;

			prevMonth.value = new Date(year, month - 1, 1).getMonth();
			prevYear.value = new Date(year, month - 1, 1).getFullYear();

			nextMonth.value = new Date(year, month + 1, 1).getMonth();
			nextYear.value = new Date(year, month + 1, 1).getFullYear();
		}

		if (period.value === 'all') {
			counts();
		} else if (period.value === 'monthly') {
			histograms();
		}

		if (period.value && selectedMetric.value) {
			_metricChanged();
		}
	},
});

async function histograms() {
	if (!startTime.value || !endTime.value) {
		throw new Error('Dates required to get histograms.');
	}

	const data = await SiteAnalytics.getHistogram(
		resource.value,
		resourceId.value,
		availableMetrics.value,
		viewAs.value,
		[startTime.value, endTime.value]
	);

	for (const i in data) {
		metricData.value[i] = data[i];
	}
}

async function counts() {
	const data = await SiteAnalytics.getCount(
		resource.value,
		resourceId.value,
		availableMetrics.value,
		viewAs.value
	);

	for (const i in data) {
		metricData.value[i] = data[i];
	}
}

function pullReport(title: string, ...components: ReportComponent[]) {
	const report = reactive(new SiteAnalyticsReport(title, components)) as SiteAnalyticsReport;

	report.init(
		resource.value,
		resourceId.value,
		selectedMetric.value.collection,
		viewAs.value,
		startTime.value,
		endTime.value
	);

	pageReports.value.push(report);
}

function _metricChanged() {
	pageReports.value = [];

	if (resource.value === 'User') {
		switch (selectedMetric.value.key) {
			case 'view':
				pullReport($gettext('Top Games'), ...ReportTopGames);
				pullReport($gettext('Top Sources'), ...ReportTopSources);
				pullReport($gettext('Countries'), ...ReportCountries);
				pullReport($gettext('Partners'), ...ReportTopPartners);
				break;

			case 'download':
				pullReport($gettext('Top Games'), ...ReportTopGames);
				pullReport($gettext('Operating Systems'), ...ReportOs);
				pullReport($gettext('Top Sources'), ...ReportTopSources);
				pullReport($gettext('Countries'), ...ReportCountries);
				pullReport($gettext('Partners'), ...ReportTopPartners);
				break;

			case 'install':
				pullReport($gettext('Top Games'), ...ReportTopGames);
				pullReport($gettext('Operating Systems'), ...ReportOs);
				pullReport($gettext('Countries'), ...ReportCountries);
				break;

			case 'comment':
				pullReport($gettext('Top Games'), ...ReportTopGames);
				pullReport($gettext('Languages'), ...ReportCommentLanguages);
				break;

			case 'rating':
				pullReport($gettext('Top Games'), ...ReportTopGames);
				pullReport($gettext('Rating Breakdown'), ...ReportRatingBreakdown);
				break;

			case 'follow':
				pullReport($gettext('Top Games'), ...ReportTopGames);
				pullReport($gettext('Countries'), ...ReportCountries);
				break;

			case 'sale':
				pullReport($gettext('Top Games'), ...ReportTopGames);
				pullReport($gettext('Top Sources'), ...ReportTopSources);
				pullReport($gettext('Countries'), ...ReportCountries);
				pullReport($gettext('Operating Systems'), ...ReportOs);
				pullReport($gettext('Partners'), ...ReportTopPartners);
				break;

			case 'revenue':
				pullReport($gettext('Revenue Stats'), ...ReportDevRevenue);
				pullReport($gettext('Top Profitable Games'), ...ReportTopGameRevenue);
				pullReport($gettext('Revenue from Partners'), ...ReportPartnerGeneratedRevenue);
				pullReport($gettext('Top Profitable Partners'), ...ReportTopPartnerRevenue);
				break;

			case 'user-charge':
				pullReport($gettext('Top Supporters'), ...ReportTopCreatorSupporters);
				pullReport($gettext('Top Posts'), ...ReportTopCreatorPosts);
				pullReport($gettext('Top Firesides'), ...ReportTopCreatorFiresides);
				break;
		}
	} else {
		switch (selectedMetric.value.key) {
			case 'view':
				pullReport($gettext('Top Sources'), ...ReportTopSources);
				pullReport($gettext('Referring Pages'), ...ReportReferringPages);
				pullReport($gettext('Countries'), ...ReportCountries);
				pullReport($gettext('Partners'), ...ReportTopPartners);
				break;

			case 'download':
				pullReport($gettext('Operating Systems'), ...ReportOs);
				pullReport($gettext('Top Sources'), ...ReportTopSources);
				pullReport($gettext('Referring Pages'), ...ReportReferringPages);
				pullReport($gettext('Countries'), ...ReportCountries);
				pullReport($gettext('Partners'), ...ReportTopPartners);
				break;

			case 'install':
				pullReport($gettext('Operating Systems'), ...ReportOs);
				pullReport($gettext('Countries'), ...ReportCountries);
				break;

			case 'comment':
				pullReport($gettext('Languages'), ...ReportCommentLanguages);
				break;

			case 'rating':
				pullReport($gettext('Rating Breakdown'), ...ReportRatingBreakdown);
				break;

			case 'follow':
				pullReport($gettext('Countries'), ...ReportCountries);
				break;

			case 'sale':
				pullReport($gettext('Top Sources'), ...ReportTopSources);
				pullReport($gettext('Referring Pages'), ...ReportReferringPages);
				pullReport($gettext('Countries'), ...ReportCountries);
				pullReport($gettext('Operating Systems'), ...ReportOs);
				pullReport($gettext('Partners'), ...ReportTopPartners);
				break;

			case 'revenue':
				pullReport($gettext('Revenue Stats'), ...ReportDevRevenue);
				pullReport($gettext('Revenue from Partners'), ...ReportPartnerGeneratedRevenue);
				pullReport($gettext('Top Profitable Partners'), ...ReportTopPartnerRevenue);
				break;
		}
	}
}
</script>

<template>
	<div v-if="isBootstrapped" class="route-analytics">
		<AppPageHeader>
			<nav class="breadcrumb">
				<ul>
					<li>
						<RouterLink
							:to="{
								name: 'dash.analytics',
								params: { resource: 'User', resourceId: user.id },
								query: $route.query,
							}"
							active-class="active"
						>
							<AppTranslate class="breadcrumb-tag">User</AppTranslate>
							@{{ user.username }}
						</RouterLink>
						<AppJolticon
							v-if="game"
							icon="chevron-right"
							class="breadcrumb-separator"
						/>
					</li>
					<li v-if="game">
						<RouterLink
							:to="{
								name: 'dash.analytics',
								params: { resource: 'Game', resourceId: game.id },
								query: $route.query,
							}"
							active-class="active"
						>
							<AppTranslate class="breadcrumb-tag">Game</AppTranslate>
							{{ game.title }}
						</RouterLink>
						<AppJolticon
							v-if="gamePackage"
							icon="chevron-right"
							class="breadcrumb-separator"
						/>
					</li>
					<li v-if="gamePackage">
						<RouterLink
							:to="{
								name: 'dash.analytics',
								params: { resource: 'Game_Package', resourceId: gamePackage.id },
								query: $route.query,
							}"
							active-class="active"
						>
							<AppTranslate class="breadcrumb-tag">Package</AppTranslate>
							{{ gamePackage.title || game?.title }}
						</RouterLink>
						<AppJolticon
							v-if="release"
							icon="chevron-right"
							class="breadcrumb-separator"
						/>
					</li>
					<li v-if="release">
						<RouterLink
							:to="{
								name: 'dash.analytics',
								params: { resource: 'Game_Release', resourceId: release.id },
								query: $route.query,
							}"
							active-class="active"
						>
							<AppTranslate class="breadcrumb-tag">Release</AppTranslate>
							{{ release.version_number }}
						</RouterLink>
					</li>
				</ul>
			</nav>

			<template #nav>
				<nav class="platform-list inline">
					<ul>
						<li>
							<RouterLink
								:to="{
									name: 'dash.analytics',
									params: $route.params,
									query: {
										period: 'all',
										partner: $route.query.partner,
									},
								}"
								:class="{ active: period === 'all' }"
							>
								<AppTranslate>All-Time</AppTranslate>
							</RouterLink>
						</li>
						<li>
							<RouterLink
								:to="{
									name: 'dash.analytics',
									params: $route.params,
									query: {
										period: 'monthly',
										partner: $route.query.partner,
									},
								}"
								:class="{ active: period === 'monthly' }"
							>
								<AppTranslate>Monthly</AppTranslate>
							</RouterLink>
						</li>
					</ul>
				</nav>
			</template>

			<template #controls>
				<AppPageHeaderControls v-if="period === 'monthly'">
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
						/>
					</template>
				</AppPageHeaderControls>
			</template>
		</AppPageHeader>

		<template v-if="metricData[selectedMetric.key]">
			<AppExpand :when="period === 'monthly' && !!metricData[selectedMetric.key].graph">
				<AppGraph :dataset="metricData[selectedMetric.key].graph" />
			</AppExpand>

			<div ref="metricsElem" class="-metric-stats-wrapper">
				<AppScrollAffix :disabled="Screen.height < 800" :padding="0">
					<AppSpacer vertical :scale="4" />

					<AppScrollScroller horizontal>
						<div class="-metric-stats">
							<div
								v-for="metric of availableMetricsBang"
								:key="metric.key"
								v-app-scroll-when.nearest.animate="
									selectedMetric.key === metric.key
								"
								class="-metric-stat"
							>
								<RouterLink
									class="stat-graph-overlay"
									:class="{
										active: selectedMetric.key === metric.key,
									}"
									:to="{
										name: 'dash.analytics',
										params: { metricKey: metric.key },
										query: $route.query,
									}"
								>
									<div class="stat-big">
										<div class="stat-big-label">
											{{ metric.label }}
										</div>
										<div class="stat-big-digit">
											<template v-if="metric.type === 'number'">
												{{ formatNumber(metricData[metric.key]?.total) }}
											</template>
											<template v-else-if="metric.type === 'currency'">
												{{ formatCurrency(metricData[metric.key]?.total) }}
											</template>
										</div>
									</div>

									<AppGraph
										v-if="period === 'monthly' && metricData[metric.key]"
										:dataset="metricData[metric.key].graph"
										background-variant
									/>
								</RouterLink>
							</div>
						</div>
					</AppScrollScroller>
				</AppScrollAffix>
			</div>

			<div v-if="pageReports.length" class="-reports">
				<AppSpacer vertical :scale="4" />

				<section class="section -reports">
					<div class="container">
						<div v-for="(report, i) of pageReports" :id="`report-${i}`" :key="i">
							<h2 :class="{ 'section-header': i === 0 }">
								{{ report.title }}
							</h2>

							<AppLoading v-if="!report.isLoaded" />

							<div v-if="report.isLoaded" class="row">
								<div v-for="(component, n) of report.components" :key="n">
									<AppAnalyticsReportSimpleStat
										v-if="
											component.type === 'sum' || component.type === 'average'
										"
										:report-data="component"
									/>
									<AppAnalyticsReportTopComposition
										v-else-if="
											component.type === 'top-composition' ||
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
				</section>
			</div>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.-metric-stats-wrapper
	&
	::v-deep(.gj-scroll-affixed)
		// Need this since we affix it
		background-color: var(--theme-bg)
		border-bottom: 1px solid var(--theme-bg-subtle)
		z-index: 1

.-metric-stats
	white-space: nowrap
	text-align: center

.-metric-stat
	display: inline-block
	margin: 0 24px
	width: 150px
	text-align: start

.-reports
	min-height: calc(100vh - var(--shell-top) - v-bind(metricsHeight))
</style>
