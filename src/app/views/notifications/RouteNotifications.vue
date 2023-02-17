<script lang="ts">
import { computed, ref, Ref, watch } from 'vue';
import { RouteLocationNormalized, useRoute } from 'vue-router';
import { Api } from '../../../_common/api/api.service';
import AppButton from '../../../_common/button/AppButton.vue';
import AppJolticon from '../../../_common/jolticon/AppJolticon.vue';
import { Notification } from '../../../_common/notification/notification-model';
import { createAppRoute, defineAppRouteOptions } from '../../../_common/route/route-component';
import AppSpacer from '../../../_common/spacer/AppSpacer.vue';
import { $gettext } from '../../../_common/translate/translate.service';
import AppActivityFeedPlaceholder from '../../components/activity/feed/AppActivityFeedPlaceholder.vue';
import { ActivityFeedService } from '../../components/activity/feed/feed-service';
import { ActivityFeedView } from '../../components/activity/feed/view';
import { useGridStore } from '../../components/grid/grid-store';
import { AppActivityFeedLazy } from '../../components/lazy';
import { useAppStore } from '../../store';
import { NotificationsFilterModal } from './filter/modal.service';
import { routeNotifications } from './notifications.route';

export const SUPPORTED_NOTIFICATION_FEED_TYPES = Notification.NOTIFICATION_FEED_TYPES;
export const NOTIFICATION_FILTER_QUERY = 'f';
export const NOTIFICATION_FILTER_FIELD = 'notificationTypes';

export default {
	...defineAppRouteOptions({
		lazy: true,
		deps: { query: ['feed_last_id', NOTIFICATION_FILTER_QUERY] },
		resolver: ({ route }) =>
			Api.sendRequest(
				ActivityFeedService.makeFeedUrl(route, '/web/dash/activity/notifications'),
				{
					[NOTIFICATION_FILTER_FIELD]: getNotificationTypesFromQuery(
						route,
						NOTIFICATION_FILTER_QUERY
					),
				},
				{
					allowComplexData: [NOTIFICATION_FILTER_FIELD],
				}
			),
	}),
};

function getNotificationTypesFromQuery(route: RouteLocationNormalized, queryKey: string) {
	let notificationTypes: string[] | null = null;

	const queryData = route.query[queryKey];
	if (queryData && typeof queryData === 'string') {
		const initialFilters = queryData
			.split(',')
			.filter(i => SUPPORTED_NOTIFICATION_FEED_TYPES.includes(i));

		if (initialFilters.length) {
			notificationTypes = initialFilters;
		}
	}

	if (!notificationTypes || !notificationTypes.length) {
		notificationTypes = SUPPORTED_NOTIFICATION_FEED_TYPES;
	}

	return notificationTypes;
}
</script>

<script lang="ts" setup>
const { unreadNotificationsCount, markNotificationsAsRead } = useAppStore();
const { grid } = useGridStore();
const route = useRoute();

const feed = ref(null) as Ref<ActivityFeedView | null>;

const itemsPerPage = ref(15);
const totalStickersCount = ref(0);
const isStickersLoading = ref(true);

const isBootstrapped = ref(false);

const routeTitle = computed(() => $gettext(`Your Notifications`));

const existingFilters = computed<string[] | undefined>(
	() => feed.value?.extraData?.[NOTIFICATION_FILTER_FIELD]
);

const hasFilter = computed(
	() =>
		existingFilters.value &&
		existingFilters.value.length !== SUPPORTED_NOTIFICATION_FEED_TYPES.length
);

watch(
	unreadNotificationsCount,
	() => {
		if (
			feed.value &&
			!hasFilter.value &&
			unreadNotificationsCount.value > feed.value.newCount
		) {
			feed.value.newCount = unreadNotificationsCount.value;
		}
	},
	{ immediate: true }
);

createAppRoute({
	routeTitle,
	onInit() {
		feed.value = ActivityFeedService.routeInit(isBootstrapped.value);
	},
	async onResolved({ payload, fromCache }) {
		isBootstrapped.value = true;
		itemsPerPage.value = payload.perPage || itemsPerPage.value;

		feed.value = ActivityFeedService.routed(
			feed.value,
			{
				type: 'Notification',
				name: 'notification',
				url: `/web/dash/activity/more/notifications`,
				extraData: {
					[NOTIFICATION_FILTER_FIELD]: getNotificationTypesFromQuery(
						route,
						NOTIFICATION_FILTER_QUERY
					),
				},
				itemsPerPage: itemsPerPage.value,
			},
			payload.items,
			fromCache
		);

		// Only push the view for "fresh" activity feeds that aren't being
		// filtered.
		if (!fromCache && !hasFilter.value) {
			grid.value?.pushViewNotifications('notifications');
		}

		const countPayload = await Api.sendRequest(`/web/stickers/user-count`);
		totalStickersCount.value = countPayload.count;
		isStickersLoading.value = false;
	},
});

function onLoadedNew() {
	if (unreadNotificationsCount.value > 0) {
		grid.value?.pushViewNotifications('notifications');
	}
}

function onClickFilter() {
	NotificationsFilterModal.show({
		filters: existingFilters.value ?? SUPPORTED_NOTIFICATION_FEED_TYPES,
		replaceRoute: true,
	});
}
</script>

<template>
	<section class="section">
		<div class="container">
			<div class="row">
				<div class="col-sm-9 col-md-8 col-lg-7 col-centered">
					<p v-if="feed" class="-header">
						<a
							class="small"
							:class="{
								'link-muted': !hasFilter,
							}"
							@click="onClickFilter"
						>
							<AppJolticon icon="filter" middle />
							{{ $gettext(`Filter`) }}
						</a>

						<a
							v-if="feed.hasItems && !hasFilter"
							class="link-muted small"
							@click="markNotificationsAsRead()"
						>
							{{ $gettext(`Mark all as read`) }}
						</a>
					</p>

					<template v-if="!feed || !feed.isBootstrapped">
						<AppActivityFeedPlaceholder />
					</template>
					<template v-else>
						<template v-if="!feed.hasItems">
							<div v-if="hasFilter" class="alert full-bleed-xs">
								{{
									$gettext(
										`You don't have any notifications matching your filter.`
									)
								}}

								<AppSpacer vertical :scale="4" />

								<AppButton block solid :to="routeNotifications">
									{{ $gettext(`Clear filters`) }}
								</AppButton>
							</div>
							<div v-else class="alert full-bleed-xs">
								{{ $gettext(`You don't have any notifications yet.`) }}
							</div>
						</template>
						<template v-else>
							<AppActivityFeedLazy :feed="feed" @load-new="onLoadedNew" />
						</template>
					</template>
				</div>
			</div>
		</div>
	</section>
</template>

<style lang="stylus" scoped>
.-header
	display: flex
	justify-content: flex-end
	gap: 12px
</style>
