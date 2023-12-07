<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import { Connection } from '../../../../_common/connection/connection-service';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import {
	NotificationFeedTypes,
	NotificationModel,
} from '../../../../_common/notification/notification-model';
import AppPopper from '../../../../_common/popper/AppPopper.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { useAppStore } from '../../../store';
import {
	NOTIFICATION_FILTER_FIELD,
	SUPPORTED_NOTIFICATION_FEED_TYPES,
} from '../../../views/notifications/RouteNotifications.vue';
import { showNotificationsFilterModal } from '../../../views/notifications/filter/modal.service';
import { routeNotifications } from '../../../views/notifications/notifications.route';
import { ActivityFeedView } from '../../activity/feed/view';
import { useGridStore } from '../../grid/grid-store';
import { AppActivityFeedLazy } from '../../lazy';

const route = useRoute();
const router = useRouter();
const { notificationState, unreadNotificationsCount, markNotificationsAsRead } = useAppStore();
const { grid } = useGridStore();

const isShowing = ref(false);
const isLoading = ref(true);
const feed = ref<ActivityFeedView>();

/**
 * This loads in lazily, so we want to capture it once it bootstraps into the
 * store and wrap it with a view.
 */
watch(
	notificationState,
	newState => {
		if (newState) {
			feed.value = new ActivityFeedView(newState, {
				slice: 15,
				shouldScroll: false,
				shouldShowUserCards: false,
				// Some default value before the real feed data gets populated
				// on show.
				itemsPerPage: 15,
				extraData: {
					[NOTIFICATION_FILTER_FIELD]: SUPPORTED_NOTIFICATION_FEED_TYPES,
				},
			});
		} else {
			feed.value = undefined;
		}
	},
	{ immediate: true }
);

/**
 * For mobile, the navbar item should be active when they are on notifications
 * page, since there is no popover on mobile.
 */
const isNavbarItemActive = computed(() => {
	return (Screen.isXs && route.name === 'notifications') || isShowing.value;
});

/**
 * When they click the item in the navbar, we don't want to open the popover on
 * mobile. Let's just go to the notifications page.
 */
function onNavbarItemClick(e: Event) {
	if (Screen.isXs) {
		e.stopPropagation();
		router.push({ name: 'notifications' });
	}
}

async function onShow() {
	isShowing.value = true;

	if (feed.value) {
		// If the feed isn't bootstrapped with data, then we have to do the
		// first bootstrapping call to get data into it.
		if (!feed.value.isBootstrapped) {
			const payload = await Api.sendRequest(
				'/web/dash/activity/notifications',
				{
					[NOTIFICATION_FILTER_FIELD]: SUPPORTED_NOTIFICATION_FEED_TYPES,
				},
				{
					allowComplexData: [NOTIFICATION_FILTER_FIELD],
				}
			);

			const items = NotificationModel.populate(payload.items);
			feed.value.append(items);

			if (payload.perPage) {
				feed.value.itemsPerPage = payload.perPage;
			}
		}
		// If it is already bootstrapped, we just want to load new items if
		// there is any.
		else if (unreadNotificationsCount.value > 0) {
			await feed.value.reload();
		}

		if (unreadNotificationsCount.value > 0) {
			grid.value?.pushViewNotifications('notifications');
		}
	}

	isLoading.value = false;
}

function onHide() {
	isShowing.value = false;
}

function onClickFilter() {
	showNotificationsFilterModal({
		filters: NotificationFeedTypes,
		replaceRoute: route.name === routeNotifications.name,
	});
}
</script>

<template>
	<AppPopper
		v-if="!Connection.isClientOffline"
		popover-class="fill-dark"
		fixed
		hide-on-state-change
		width="400px"
		@show="onShow()"
		@hide="onHide()"
	>
		<a
			v-app-tooltip.bottom="$gettext(`Notifications`)"
			v-app-track-event="`top-nav:notifications:toggle`"
			class="navbar-item"
			:class="{ active: isNavbarItemActive }"
			@click.capture="onNavbarItemClick"
		>
			<span
				v-if="unreadNotificationsCount"
				class="notification-tag tag tag-highlight anim-fade-enter anim-fade-leave"
			>
				{{ unreadNotificationsCount }}
			</span>
			<AppJolticon icon="bell-filled" />
		</a>

		<template v-if="feed && isShowing" #header>
			<div class="-header fill-darker small">
				<a class="link-muted" @click="onClickFilter()">
					<AppJolticon icon="filter" middle />
					{{ $gettext(`Filter`) }}
				</a>

				<a class="link-muted" @click="markNotificationsAsRead()">
					{{ $gettext(`Mark all as read`) }}
				</a>
			</div>
		</template>

		<template v-if="feed && isShowing" #popover>
			<div class="-wrapper">
				<template v-if="isLoading">
					<br />
					<AppLoading centered />
				</template>
				<template v-else>
					<template v-if="!feed || !feed.hasItems">
						<div class="alert">
							{{ $gettext(`You don't have any notifications yet.`) }}
						</div>
					</template>
					<template v-else>
						<AppActivityFeedLazy :feed="feed" />
					</template>
				</template>
			</div>
		</template>

		<template v-if="feed && isShowing" #footer>
			<div class="fill-darker">
				<AppButton :to="{ name: 'notifications' }" block trans>
					{{ $gettext(`View all`) }}
				</AppButton>
			</div>
		</template>
	</AppPopper>
</template>

<style lang="stylus" scoped>
::v-deep(.timeline-list-item-split)
	full-bleed()

// The full-bleed would add a scrollbar if we didn't cut it off like this.
.-wrapper
	overflow: hidden
	padding: 10px

.-header
	padding: $popover-spacing
	display: flex
	justify-content: flex-end
	gap: 12px
</style>
