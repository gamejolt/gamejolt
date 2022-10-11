import { computed, inject, InjectionKey, ref, Ref, shallowRef, ShallowRef, watch } from 'vue';
import { Router } from 'vue-router';
import { CommunityJoinLocation } from '../../_common/analytics/analytics.service';
import { Api } from '../../_common/api/api.service';
import { Backdrop, BackdropController } from '../../_common/backdrop/backdrop.service';
import {
	Community,
	joinCommunity as joinCommunityModel,
	leaveCommunity as leaveCommunityModel,
} from '../../_common/community/community.model';
import { Connection } from '../../_common/connection/connection-service';
import {
	ContentFocus,
	registerContentFocusWatcher as registerFocusWatcher,
} from '../../_common/content-focus/content-focus.service';
import { showSuccessGrowl } from '../../_common/growls/growls.service';
import { ModalConfirm } from '../../_common/modal/confirm/confirm-service';
import { Screen } from '../../_common/screen/screen-service';
import { SidebarStore } from '../../_common/sidebar/sidebar.store';
import { StickerStore } from '../../_common/sticker/sticker-store';
import { CommonStore } from '../../_common/store/common-store';
import { $gettext } from '../../_common/translate/translate.service';
import { ActivityFeedState } from '../components/activity/feed/state';
import { BroadcastModal } from '../components/broadcast-modal/broadcast-modal.service';
import type { GridClient } from '../components/grid/client.service';
import { CommunityStates } from './community-state';
import { LibraryStore } from './library';
import { QuestStore } from './quest';

// the two types an event notification can assume, either "activity" for the post activity feed or "notifications"
type UnreadItemType = 'activity' | 'notifications';
type TogglableLeftPane = '' | 'chat' | 'context' | 'library' | 'mobile';

export const AppStoreKey: InjectionKey<AppStore> = Symbol('app-store');

export type AppStore = ReturnType<typeof createAppStore>;

export function useAppStore() {
	return inject(AppStoreKey)!;
}

export function createAppStore({
	router,
	commonStore,
	sidebarStore,
	libraryStore,
	getQuestStore,
	stickerStore,
}: {
	router: Router;
	commonStore: CommonStore;
	sidebarStore: SidebarStore;
	libraryStore: LibraryStore;
	getQuestStore: () => QuestStore;
	stickerStore: StickerStore;
}) {
	const isBootstrapped = ref(false);
	const _bootstrapResolver = ref(null) as Ref<((value?: any) => void) | null>;
	const tillStoreBootstrapped = ref(new Promise(resolve => (_bootstrapResolver.value = resolve)));
	const isLibraryBootstrapped = ref(false);
	const isShellBootstrapped = ref(false);
	const isShellHidden = ref(false);

	/** Unread items in the activity feed. */
	const unreadActivityCount = ref(0);
	/** Unread items in the notification feed. */
	const unreadNotificationsCount = ref(0);
	const hasNewFriendRequests = ref(false);
	const hasNewUnlockedStickers = ref(false);

	const notificationState = ref<ActivityFeedState>();

	const mobileCbarShowing = ref(false);
	const lastOpenLeftPane = ref<Exclude<TogglableLeftPane, 'context'>>(
		Screen.isXs ? 'mobile' : 'library'
	);
	const overlayedLeftPane = ref<TogglableLeftPane>('');
	const overlayedRightPane = ref('');
	const hasContentSidebar = ref(false);

	/** Will be set to the community they're currently viewing (if any). */
	const activeCommunity = ref<Community>();
	const communities = ref<Community[]>([]);
	const communityStates = ref(new CommunityStates());

	const _backdrop = shallowRef(null) as ShallowRef<BackdropController | null>;

	const hasTopBar = computed(() => !isShellHidden.value);
	const hasSidebar = computed(() => !isShellHidden.value);

	const hasCbar = computed(() => {
		if (isShellHidden.value || commonStore.isUserTimedOut.value) {
			return false;
		}

		// The cbar is pretty empty without a user and active context pane,
		// so we want to hide it if those conditions are met.
		if (!commonStore.user.value && !sidebarStore.activeContextPane.value && !Screen.isXs) {
			return false;
		}

		return mobileCbarShowing.value || !Screen.isXs;
	});

	/**
	 * Returns the current overlaying pane if there is one.
	 *
	 * Large breakpoint defaults to 'context' on applicable routes.
	 * */
	const visibleLeftPane = computed<TogglableLeftPane>(() => {
		// If there's no other left-pane pane opened, Large breakpoint should
		// always show the 'context' pane if there is a context component set.
		if (Screen.isLg && sidebarStore.activeContextPane.value && !overlayedLeftPane.value) {
			return 'context';
		}

		return overlayedLeftPane.value;
	});

	const visibleRightPane = computed(() => overlayedRightPane.value);

	const notificationCount = computed(
		() => unreadActivityCount.value + unreadNotificationsCount.value
	);

	// Sync with the ContentFocus service.
	registerFocusWatcher(
		ContentFocus,
		// We only care if the panes are overlaying, not if they're visible in
		// the page without overlaying. Example is that context panes show
		// in-page on large displays.
		() => !overlayedLeftPane.value && !overlayedRightPane.value
	);

	// If we were offline, but we're online now, make sure our library is
	// bootstrapped. Remember we always have an app user even if we were
	// offline.
	if (GJ_IS_DESKTOP_APP) {
		watch(
			() => Connection.isOffline,
			(isOffline, prev) => {
				if (!isOffline && prev === true) {
					bootstrap();
				}
			}
		);
	}

	async function bootstrap() {
		const prevResolver = _bootstrapResolver;

		// Detach so that errors in it doesn't cause the not found page to show. This is considered
		// a sort of "async" load.
		try {
			const [shellPayload, libraryPayload] = await Promise.all([
				Api.sendRequest('/web/dash/shell', null, { detach: true }),
				Api.sendRequest('/web/library', null, { detach: true }),
			]);

			_setLibraryBootstrapped();
			_shellPayload(shellPayload);

			// If we failed to finish before we unbootstrapped, then stop.
			if (_bootstrapResolver !== prevResolver) {
				return;
			}

			libraryStore.bootstrap(libraryPayload);
		} catch (e) {}

		_setBootstrapped();

		if (!GJ_IS_DESKTOP_APP && !import.meta.env.SSR) {
			BroadcastModal.check();
		}
	}

	async function logout() {
		const result = await ModalConfirm.show(
			$gettext('Are you seriously going to leave us?'),
			$gettext('Logout?')
		);

		if (!result) {
			return;
		}

		// Must send POST.
		// This should clear out the user as well.
		await Api.sendRequest('/web/dash/account/logout', {});

		// We go to the homepage currently just in case they're in a view they shouldn't be.
		router.push({ name: 'discover.home' });

		showSuccessGrowl($gettext('You are now logged out.'), $gettext('Goodbye!'));
	}

	async function clear() {
		tillStoreBootstrapped.value = new Promise(resolve => (_bootstrapResolver.value = resolve));
		libraryStore.clear();
	}

	async function loadNotificationState() {
		notificationState.value = new ActivityFeedState({
			type: 'Notification',
			name: 'notification',
			url: `/web/dash/activity/more/notifications`,
		});
	}

	async function clearNotificationState() {
		notificationState.value = undefined;
	}

	async function markNotificationsAsRead() {
		if (!notificationState.value) {
			return;
		}

		// Reset the watermark first so that it happens immediately.
		_resetNotificationWatermark();
		await Api.sendRequest('/web/dash/activity/mark-all-read', {});
	}

	// This Action is only used for the 'Xs' breakpoint.
	async function toggleCbarMenu() {
		_toggleCbarMenu();
		if (visibleLeftPane.value) {
			// Close the left-pane if the cbar is also closing.
			_toggleLeftPane();
		} else {
			// Open the left-pane depending on the SidebarStore information when
			// the cbar shows.
			_toggleLeftPane(
				sidebarStore.activeContextPane.value ? 'context' : lastOpenLeftPane.value
			);
		}

		checkBackdrop();
	}

	/** Show the context pane if there's one available. */
	async function showContextPane() {
		if (visibleLeftPane.value !== 'context' && sidebarStore.activeContextPane.value) {
			toggleLeftPane('context');
		}
	}

	/** Passing no value will close any open left-panes. */
	async function toggleLeftPane(type?: TogglableLeftPane) {
		if (type === 'context' && !sidebarStore.activeContextPane.value) {
			// Don't show the context pane if the SidebarStore has no context to
			// show.
			_toggleLeftPane();
			return;
		}

		_toggleLeftPane(type);
		checkBackdrop();
	}

	async function toggleRightPane(type?: string) {
		_toggleRightPane(type);
		checkBackdrop();
	}

	async function toggleChatPane() {
		_toggleLeftPane('chat');
		checkBackdrop();
	}

	async function clearPanes() {
		_clearPanes();
		checkBackdrop();
	}

	/** Using this will add or remove backdrops as needed for overlaying panes. */
	async function checkBackdrop() {
		if (
			(!!overlayedRightPane.value || !!overlayedLeftPane.value) &&
			// We only want backdrops on the Lg breakpoint if the pane isn't context.
			!(Screen.isLg && overlayedLeftPane.value === 'context')
		) {
			if (_backdrop.value) {
				return;
			}

			_addBackdrop();
			_backdrop.value!.onClicked = () => {
				_clearPanes();
				checkBackdrop();
			};
		} else if (_backdrop) {
			_removeBackdrop();
		}
	}

	function hideShell() {
		isShellHidden.value = true;
	}

	function showShell() {
		isShellHidden.value = false;
	}

	function setHasContentSidebar(isShowing: boolean) {
		// We use this to scooch the footer over to make room for the sidebar
		// content, but we only care about that when the sidebar isn't behaving
		// as an overlay - which is currently only on the Lg breakpoint.
		if (Screen.isLg) {
			hasContentSidebar.value = isShowing;
		} else {
			hasContentSidebar.value = false;
		}
	}

	function incrementNotificationCount(payload: { type: UnreadItemType; count: number }) {
		if (payload.type === 'activity') {
			unreadActivityCount.value += payload.count;
		} else {
			unreadNotificationsCount.value += payload.count;
		}
	}

	function setNotificationCount(payload: { type: UnreadItemType; count: number }) {
		if (payload.type === 'activity') {
			unreadActivityCount.value = payload.count;
		} else {
			unreadNotificationsCount.value = payload.count;
		}
	}

	function setHasNewFriendRequests(has: boolean) {
		hasNewFriendRequests.value = has;
	}

	function setHasNewUnlockedStickers(has: boolean) {
		hasNewUnlockedStickers.value = has;
	}

	function _setBootstrapped() {
		isBootstrapped.value = true;
		_bootstrapResolver.value?.();
	}

	function _setLibraryBootstrapped() {
		isLibraryBootstrapped.value = true;
	}

	function _shellPayload(payload: any) {
		isShellBootstrapped.value = true;
		communities.value = Community.populate(payload.communities);
	}

	async function joinCommunity(
		community: Community,
		options: { grid: GridClient | undefined; location?: CommunityJoinLocation }
	) {
		const { grid, location } = options;

		if (community._removed) {
			return;
		}

		if (!community.is_member) {
			await joinCommunityModel(community, location);
		}

		grid?.joinCommunity(community);

		if (communities.value.find(c => c.id === community.id)) {
			return;
		}

		communities.value.unshift(community);
	}

	async function leaveCommunity(
		community: Community,
		options: {
			grid: GridClient | undefined;
			location?: CommunityJoinLocation;
			shouldConfirm?: boolean;
		}
	) {
		const { grid, location, shouldConfirm } = options;

		if (community.is_member && !community._removed) {
			if (shouldConfirm) {
				const result = await ModalConfirm.show(
					$gettext(`Are you sure you want to leave this community?`),
					$gettext(`Leave community?`)
				);

				if (!result) {
					return;
				}
			}

			await leaveCommunityModel(community, location);
		}

		grid?.leaveCommunity(community);

		const communityState = communityStates.value.getCommunityState(community);
		communityState.reset();

		const idx = communities.value.findIndex(c => c.id === community.id);
		if (idx === -1) {
			return;
		}

		communities.value.splice(idx, 1);
	}

	function setActiveCommunity(community: Community) {
		activeCommunity.value = community;
	}

	function clearActiveCommunity() {
		activeCommunity.value = undefined;
	}

	function viewCommunity(community: Community) {
		const communityState = communityStates.value.getCommunityState(community);
		communityState.hasUnreadFeaturedPosts = false;

		const idx = communities.value.findIndex(c => c.id === community.id);
		if (idx === -1) {
			return;
		}

		communities.value.splice(idx, 1);
		communities.value.unshift(community);
	}

	function _resetNotificationWatermark() {
		// Mark all loaded notifications as read through the feed watermark.
		// It's better than having to reload from the backend.
		if (notificationState.value) {
			notificationState.value.notificationWatermark = Date.now();
		}
	}

	function _toggleCbarMenu() {
		mobileCbarShowing.value = !mobileCbarShowing.value;
	}

	function _toggleLeftPane(type: TogglableLeftPane = '') {
		if (!hasSidebar.value) {
			overlayedLeftPane.value = '';
			return;
		}

		if (overlayedLeftPane.value === type) {
			overlayedLeftPane.value = '';
		} else {
			overlayedLeftPane.value = type;
		}

		if (type && type !== 'context') {
			lastOpenLeftPane.value = type;
		}

		mobileCbarShowing.value = !!overlayedLeftPane.value;
		overlayedRightPane.value = '';
	}

	function _toggleRightPane(type = '') {
		if (overlayedRightPane.value === type) {
			overlayedRightPane.value = '';
		} else {
			overlayedRightPane.value = type;
		}

		overlayedLeftPane.value = '';
	}

	function _clearPanes() {
		overlayedRightPane.value = '';
		overlayedLeftPane.value = '';
		mobileCbarShowing.value = false;
	}

	function _addBackdrop() {
		if (_backdrop.value) {
			return;
		}

		_backdrop.value = Backdrop.push({ context: document.body });
	}

	function _removeBackdrop() {
		if (!_backdrop.value) {
			return;
		}

		_backdrop.value.remove();
		_backdrop.value = null;
	}

	// Handles route meta changes during redirects.
	// Routes in the app section can define the following meta:
	// 	isFullPage: boolean - wether to not display the shell and treat the route as a "full page"
	router.beforeEach((to, _from, next) => {
		if (to.matched.some(record => record.meta.isFullPage)) {
			hideShell();
		} else {
			showShell();
		}

		next();
	});

	return {
		isBootstrapped,
		tillStoreBootstrapped,
		isLibraryBootstrapped,
		isShellBootstrapped,
		isShellHidden,
		unreadActivityCount,
		unreadNotificationsCount,
		hasNewFriendRequests,
		hasNewUnlockedStickers,
		notificationState,
		mobileCbarShowing,
		lastOpenLeftPane,
		overlayedLeftPane,
		overlayedRightPane,
		hasContentSidebar,
		activeCommunity,
		communities,
		communityStates,
		hasTopBar,
		hasSidebar,
		hasCbar,
		visibleLeftPane,
		visibleRightPane,
		notificationCount,
		bootstrap,
		logout,
		clear,
		loadNotificationState,
		clearNotificationState,
		markNotificationsAsRead,
		toggleCbarMenu,
		showContextPane,
		toggleLeftPane,
		toggleRightPane,
		toggleChatPane,
		clearPanes,
		checkBackdrop,
		hideShell,
		showShell,
		setHasContentSidebar,
		incrementNotificationCount,
		setNotificationCount,
		setHasNewFriendRequests,
		setHasNewUnlockedStickers,
		joinCommunity,
		leaveCommunity,
		setActiveCommunity,
		clearActiveCommunity,
		viewCommunity,
		getQuestStore,
		stickerStore,
	};
}
