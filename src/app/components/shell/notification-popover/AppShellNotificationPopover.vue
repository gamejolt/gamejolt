<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { sleep } from '../../../../utils/utils';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import { Connection } from '../../../../_common/connection/connection-service';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import { Notification } from '../../../../_common/notification/notification-model';
import AppPopper from '../../../../_common/popper/AppPopper.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { useEventSubscription } from '../../../../_common/system/event/event-topic';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { useAppStore } from '../../../store';
import { ActivityFeedView } from '../../activity/feed/view';
import { onNewStickers } from '../../grid/client.service';
import { AppActivityFeedLazy } from '../../lazy';
import AppShellNotificationPopoverStickerNavItem from './sticker-nav-item/AppShellNotificationPopoverStickerNavItem.vue';

interface StickerAnimationData {
	key: string;
	stickerImg: string;
}

const route = useRoute();
const router = useRouter();
const {
	notificationState,
	unreadNotificationsCount,
	hasNewUnlockedStickers,
	markNotificationsAsRead,
	grid,
} = useAppStore();

const newStickerAnimContainer = ref<HTMLDivElement>();
const isShowing = ref(false);
const isLoading = ref(true);
const feed = ref<ActivityFeedView>();
const totalStickersCount = ref(0);
const animatingStickers = ref<StickerAnimationData[]>([]);

useEventSubscription(onNewStickers, _onNewStickersHandler);

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
			const payload = await Api.sendRequest('/web/dash/activity/notifications');

			const items = Notification.populate(payload.items);
			feed.value.append(items);

			if (payload.perPage) {
				feed.value.itemsPerPage = payload.perPage;
			}
		}
		// If it is already bootstrapped, we just want to load new items if
		// there is any.
		else if (unreadNotificationsCount.value > 0) {
			await feed.value.loadNew(unreadNotificationsCount.value);
		}

		if (unreadNotificationsCount.value > 0) {
			grid.value?.pushViewNotifications('notifications');
		}
	}

	const countPayload = await Api.sendRequest(`/web/stickers/user-count`);
	totalStickersCount.value = countPayload.count;

	isLoading.value = false;
}

function onHide() {
	isShowing.value = false;
}

/**
 * Handles the Grid event of new sticker unlocks to show animations.
 */
async function _onNewStickersHandler(stickerImgUrls: string[]) {
	for (const stickerImgUrl of stickerImgUrls) {
		const key = Date.now().toString();

		animatingStickers.value.push({
			key,
			stickerImg: stickerImgUrl,
		});

		setTimeout(() => removeStickerAnimation(key), 1500);

		// Sleep for slightly less than animation duration (~1.5s). This
		// slightly overlays the animations which results in a smoother and
		// faster unlock experience.
		await sleep(1300);
	}
}

function removeStickerAnimation(key: string) {
	const index = animatingStickers.value.findIndex(i => i.key === key);
	if (index !== -1) {
		animatingStickers.value.splice(index, 1);
	}
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
			<div ref="newStickerAnimContainer" class="-new-sticker-anim-container">
				<div
					v-for="{ key, stickerImg } in animatingStickers"
					:key="key"
					class="-new-sticker"
				>
					<img class="-new-sticker-img" :src="stickerImg" />
				</div>
			</div>
		</a>

		<template v-if="feed && isShowing" #header>
			<div class="-header fill-darker small">
				<a class="link-muted" @click="markNotificationsAsRead()">
					<AppTranslate>Mark All as Read</AppTranslate>
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
					<AppShellNotificationPopoverStickerNavItem
						v-if="totalStickersCount > 0"
						:sticker-count="totalStickersCount"
						:has-new="hasNewUnlockedStickers"
					/>
					<template v-if="!feed || !feed.hasItems">
						<div class="alert">
							<AppTranslate>You don't have any notifications yet.</AppTranslate>
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
					<AppTranslate>View All</AppTranslate>
				</AppButton>
			</div>
		</template>
	</AppPopper>
</template>

<style lang="stylus" scoped>
$-new-sticker-size = 32px

::v-deep(.timeline-list-item-split)
	full-bleed()

// The full-bleed would add a scrollbar if we didn't cut it off like this.
.-wrapper
	overflow: hidden
	padding: 10px

.-header
	padding: $popover-spacing
	text-align: right

.-new-sticker-anim-container
	position: absolute
	left: 14px
	top: 16px
	user-select: none
	pointer-events: none
	z-index: 3

.-new-sticker
	position: fixed
	width: $-new-sticker-size
	height: $-new-sticker-size
	animation-name: anim
	animation-duration: 1.5s
	animation-iteration-count: 1
	animation-fill-mode: forwards
	animation-timing-function: ease-out
	z-index: 4
	user-select: none
	pointer-events: none

	&-img
		display: block
		width: $-new-sticker-size
		height: $-new-sticker-size

@keyframes anim
	0%
		transform: none
		opacity: 0.5

	50%
		transform: translateY(100px) scale(1.5)
		opacity: 1

	55%
		transform: translateY(100px) scale(1.7) rotateZ(-20deg)

	60%
		transform: translateY(100px) scale(1.9) rotateZ(20deg)

	65%
		transform: translateY(100px) scale(2.1) rotateZ(-20deg)

	70%
		transform: translateY(100px) scale(2.3) rotateZ(20deg)
		opacity: 1

	100%
		transform: translateY(0) scale(0)
		opacity: 0
</style>
