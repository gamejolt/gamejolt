<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Vue, Watch } from 'vue-property-decorator';
import { sleep } from '../../../../utils/utils';
import { Api } from '../../../../_common/api/api.service';
import { Connection } from '../../../../_common/connection/connection-service';
import AppLoading from '../../../../_common/loading/loading.vue';
import { Notification } from '../../../../_common/notification/notification-model';
import AppPopper from '../../../../_common/popper/popper.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { useEventSubscription } from '../../../../_common/system/event/event-topic';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { AppStore, useAppStore } from '../../../store';
import { ActivityFeedView } from '../../activity/feed/view';
import { onNewStickers } from '../../grid/client.service';
import { AppActivityFeedLazy } from '../../lazy';
import AppShellAccountPopoverNewSticker from './new-sticker/new-sticker.vue';
import AppShellNotificationPopoverStickerNavItem from './sticker-nav-item/sticker-nav-item.vue';

@Options({
	components: {
		AppPopper,
		AppLoading,
		AppActivityFeed: AppActivityFeedLazy,
		AppShellNotificationPopoverStickerNavItem,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppShellNotificationPopover extends Vue {
	store = setup(() => useAppStore());

	get notificationState() {
		return this.store.notificationState;
	}

	get unreadNotificationsCount() {
		return this.store.unreadNotificationsCount;
	}

	get markNotificationsAsRead() {
		return this.store.markNotificationsAsRead;
	}

	get hasNewUnlockedStickers() {
		return this.store.hasNewUnlockedStickers;
	}

	get grid() {
		return this.store.grid;
	}

	isShowing = false;
	isLoading = true;
	feed: ActivityFeedView | null = null;
	totalStickersCount = 0;

	readonly Connection = Connection;

	declare $refs: {
		newStickerAnimContainer: HTMLDivElement;
	};

	get count() {
		return this.unreadNotificationsCount;
	}

	/**
	 * For mobile, the navbar item should be active when they are on
	 * notifications page, since there is no popover on mobile.
	 */
	get isNavbarItemActive() {
		return (Screen.isXs && this.$route.name === 'notifications') || this.isShowing;
	}

	created() {
		useEventSubscription(onNewStickers, this.onNewStickers.bind(this));
	}

	/**
	 * This loads in lazily, so we want to capture it once it bootstraps into
	 * the store and wrap it with a view.
	 */
	@Watch('notificationState', { immediate: true })
	onNotificationStateChange(state: AppStore['notificationState']['value']) {
		if (state) {
			this.feed = new ActivityFeedView(state, {
				slice: 15,
				shouldScroll: false,
				shouldShowUserCards: false,
				// Some default value before the real feed data gets populated on show.
				itemsPerPage: 15,
			});
		} else {
			this.feed = null;
		}
	}

	/**
	 * When they click the item in the navbar, we don't want to open the popover
	 * on mobile. Let's just go to the notifications page.
	 */
	onNavbarItemClick(e: Event) {
		if (Screen.isXs) {
			e.stopPropagation();
			this.$router.push({ name: 'notifications' });
		}
	}

	async onShow() {
		this.isShowing = true;

		if (this.feed) {
			// If the feed isn't bootstrapped with data, then we have to do the
			// first bootstrapping call to get data into it.
			if (!this.feed.isBootstrapped) {
				const $payload = await Api.sendRequest('/web/dash/activity/notifications');

				const items = Notification.populate($payload.items);
				this.feed.append(items);

				if ($payload.perPage) {
					this.feed.itemsPerPage = $payload.perPage;
				}
			}
			// If it is already bootstrapped, we just want to load new items if
			// there is any.
			else if (this.unreadNotificationsCount > 0) {
				await this.feed.loadNew(this.unreadNotificationsCount);
			}

			if (this.unreadNotificationsCount > 0) {
				this.grid?.pushViewNotifications('notifications');
			}
		}

		const countPayload = await Api.sendRequest(`/web/stickers/user-count`);
		this.totalStickersCount = countPayload.count;

		this.isLoading = false;
	}

	onHide() {
		this.isShowing = false;
	}

	reset() {
		this.feed?.clear();
		this.isLoading = true;
	}

	/**
	 * Handles the Grid event of new sticker unlocks to show animations.
	 */
	private async onNewStickers(stickerImgUrls: string[]) {
		// TODO(vue3)
		for (const stickerImgUrl of stickerImgUrls) {
			// Create new sticker animation component.
			const stickerEl = new AppShellAccountPopoverNewSticker({
				propsData: {
					key: Date.now().toString(),
					stickerImg: stickerImgUrl,
				},
			});
			// Mount and add to DOM.
			stickerEl.$mount();
			this.$refs.newStickerAnimContainer.appendChild(stickerEl.$el);

			// Sleep for slightly less than animation duration (~1.5s).
			// This slightly overlays the animations which results in a smoother
			// and faster unlock experience.
			await sleep(1300);
		}
	}
}
</script>

<template>
	<app-popper
		v-if="!Connection.isClientOffline"
		popover-class="fill-dark"
		fixed
		hide-on-state-change
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
				v-if="count"
				class="notification-tag tag tag-highlight anim-fade-enter anim-fade-leave"
			>
				{{ count }}
			</span>
			<div v-if="hasNewUnlockedStickers" class="-new-tag anim-fade-enter anim-fade-leave" />
			<app-jolticon icon="bell-filled" />
			<div ref="newStickerAnimContainer" class="-new-sticker-anim-container" />
		</a>

		<template v-if="feed && isShowing" #header>
			<div class="-header fill-darker small">
				<a class="link-muted" @click="markNotificationsAsRead()">
					<translate>Mark All as Read</translate>
				</a>
			</div>
		</template>

		<template v-if="feed && isShowing" #popover>
			<div class="shell-card-popover">
				<template v-if="isLoading">
					<br />
					<app-loading centered />
				</template>
				<template v-else>
					<app-shell-notification-popover-sticker-nav-item
						v-if="totalStickersCount > 0"
						:sticker-count="totalStickersCount"
						:has-new="hasNewUnlockedStickers"
					/>
					<template v-if="!feed.hasItems">
						<div class="alert">
							<translate>You don't have any notifications yet.</translate>
						</div>
					</template>
					<template v-else>
						<app-activity-feed :feed="feed" />
					</template>
				</template>
			</div>
		</template>

		<template v-if="feed && isShowing" #footer>
			<div class="fill-darker">
				<app-button :to="{ name: 'notifications' }" block trans>
					<translate>View All</translate>
				</app-button>
			</div>
		</template>
	</app-popper>
</template>

<style lang="stylus" scoped>
::v-deep(.timeline-list-item-split)
	full-bleed()

// The full-bleed would add a scrollbar if we didn't cut it off like this.
.shell-card-popover
	overflow: hidden

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

.-new-tag
	border-radius: 50%
	width: 12px
	height: 12px
	display: block
	change-bg('highlight')
	position: absolute
	bottom: 10px
	right: 4px
	display: block
	border-color: var(--theme-darkest)
	border-width: 2px
	border-style: solid
</style>
