import {
	computed,
	inject,
	InjectionKey,
	Ref,
	ref,
	shallowReadonly,
	ShallowRef,
	shallowRef,
	watch,
} from 'vue';

import { ActivityFeedState } from '~app/components/activity/feed/state';
import { checkBroadcastModal } from '~app/components/broadcast-modal/broadcast-modal.service';
import type { GridClient } from '~app/components/grid/client.service';
import { CommunityStates } from '~app/store/community-state';
import { LibraryStore } from '~app/store/library';
import { QuestStore } from '~app/store/quest';
import { CommunityJoinLocation } from '~common/analytics/analytics.service';
import { Api } from '~common/api/api.service';
import type { BackdropController, BackdropStore } from '~common/backdrop/backdrop.service';
import {
	CommunityModel,
	joinCommunity as joinCommunityModel,
	leaveCommunity as leaveCommunityModel,
} from '~common/community/community.model';
import { Connection } from '~common/connection/connection-service';
import { registerContentFocusWatcher as registerFocusWatcher } from '~common/content-focus/content-focus.service';
import { showSuccessGrowl } from '~common/growls/growls.service';
import { showModalConfirm } from '~common/modal/confirm/confirm-service';
import { getCurrentRouter } from '~common/route/current-router-service';
import { getScreen } from '~common/screen/screen-service';
import { SidebarStore } from '~common/sidebar/sidebar.store';
import { StickerStore } from '~common/sticker/sticker-store';
import { CommonStore } from '~common/store/common-store';
import { $gettext } from '~common/translate/translate.service';

export type TogglableLeftPane =
	| ''
	| 'chat'
	| 'context'
	| 'library'
	| 'mobile'
	| 'backpack'
	| 'quests'
	| 'joltydex';

export const AppStoreKey: InjectionKey<AppStore> = Symbol('app-store');

export type AppStore = ReturnType<typeof createAppStore>;

export function useAppStore() {
	return inject(AppStoreKey)!;
}

export function createAppStore({
	commonStore,
	backdropStore,
	sidebarStore,
	libraryStore,
	getQuestStore,
	stickerStore,
}: {
	commonStore: CommonStore;
	backdropStore: BackdropStore;
	sidebarStore: SidebarStore;
	libraryStore: LibraryStore;
	getQuestStore: () => QuestStore;
	stickerStore: StickerStore;
}) {
	const { isXs, isLg } = getScreen();

	const isBootstrapped = ref(false);
	const _bootstrapResolver = ref(null) as Ref<((value?: any) => void) | null>;
	const tillStoreBootstrapped = ref(new Promise(resolve => (_bootstrapResolver.value = resolve)));
	const isLibraryBootstrapped = ref(false);
	const isShellBootstrapped = ref(false);
	const isShellHidden = ref(false);

	/** Unread items in the activity feed. */
	const unreadActivityCount = ref(0);
	/** Are there unread notifications? */
	const hasUnreadNotifications = ref(false);
	const hasNewFriendRequests = ref(false);

	const notificationState = ref<ActivityFeedState>();

	const mobileCbarShowing = ref(false);
	const lastOpenLeftPane = ref<Exclude<TogglableLeftPane, 'context'>>(
		isXs.value ? 'mobile' : 'library'
	);
	const overlayedLeftPane = ref<TogglableLeftPane>('');
	const overlayedRightPane = ref('');
	const hasContentSidebar = ref(false);

	/** Will be set to the community they're currently viewing (if any). */
	const activeCommunity = ref<CommunityModel>();
	const communities = ref<CommunityModel[]>([]);
	const communityStates = ref(new CommunityStates());

	/**
	 * Shared between every `AppSearch` instance so that the nav input and the
	 * `/search` page header input mirror each other.
	 */
	const searchQuery = ref('');

	const _backdrop = shallowRef(null) as ShallowRef<BackdropController | null>;

	const hasTopBar = computed(() => !isShellHidden.value);
	const hasSidebar = computed(() => !isShellHidden.value);

	const hasCbar = computed(() => {
		if (isShellHidden.value || commonStore.isUserTimedOut.value) {
			return false;
		}

		// The cbar is pretty empty without a user and active context pane,
		// so we want to hide it if those conditions are met.
		if (!commonStore.user.value && !sidebarStore.activeContextPane.value && !isXs.value) {
			return false;
		}

		return mobileCbarShowing.value || !isXs.value;
	});

	/**
	 * Returns the current overlaying pane if there is one.
	 *
	 * Large breakpoint defaults to 'context' on applicable routes.
	 * */
	const visibleLeftPane = computed<TogglableLeftPane>(() => {
		// If there's no other left-pane pane opened, Large breakpoint should
		// always show the 'context' pane if there is a context component set.
		if (isLg.value && sidebarStore.activeContextPane.value && !overlayedLeftPane.value) {
			return 'context';
		}

		return overlayedLeftPane.value;
	});

	const visibleRightPane = computed(() => overlayedRightPane.value);

	// Sync with the ContentFocus service.
	registerFocusWatcher(
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
			checkBroadcastModal();
		}
	}

	async function logout() {
		const result = await showModalConfirm(
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
		getCurrentRouter().push({ name: 'discover.home' });

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

	function openChatPane() {
		if (visibleLeftPane.value !== 'chat') {
			toggleChatPane();
		}
	}

	function closeChatPane() {
		if (visibleLeftPane.value === 'chat') {
			toggleChatPane();
		}
	}

	function toggleChatPane() {
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
			!(isLg.value && overlayedLeftPane.value === 'context')
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
		if (isLg.value) {
			hasContentSidebar.value = isShowing;
		} else {
			hasContentSidebar.value = false;
		}
	}

	function incrementUnreadActivityCount(count: number) {
		unreadActivityCount.value += count;
	}

	function setUnreadActivityCount(count: number) {
		unreadActivityCount.value = count;
	}

	function setHasUnreadNotifications(has: boolean) {
		hasUnreadNotifications.value = has;
	}

	function setHasNewFriendRequests(has: boolean) {
		hasNewFriendRequests.value = has;
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
		communities.value = CommunityModel.populate(payload.communities);
	}

	async function joinCommunity(
		community: CommunityModel,
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
		community: CommunityModel,
		options: {
			grid: GridClient | undefined;
			location?: CommunityJoinLocation;
			shouldConfirm?: boolean;
		}
	) {
		const { grid, location, shouldConfirm } = options;

		if (community.is_member && !community._removed) {
			if (shouldConfirm) {
				const result = await showModalConfirm(
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

	function setActiveCommunity(community: CommunityModel) {
		activeCommunity.value = community;
	}

	function clearActiveCommunity() {
		activeCommunity.value = undefined;
	}

	function viewCommunity(community: CommunityModel) {
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

		_backdrop.value = backdropStore.push({ context: document.body });
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
	getCurrentRouter().beforeEach((to, _from, next) => {
		if (to.matched.some(record => record.meta.isFullPage)) {
			hideShell();
		} else {
			showShell();
		}

		next();
	});

	return shallowReadonly({
		isBootstrapped,
		tillStoreBootstrapped,
		isLibraryBootstrapped,
		isShellBootstrapped,
		isShellHidden,
		unreadActivityCount,
		hasUnreadNotifications,
		hasNewFriendRequests,
		notificationState,
		mobileCbarShowing,
		lastOpenLeftPane,
		overlayedLeftPane,
		overlayedRightPane,
		hasContentSidebar,
		activeCommunity,
		communities,
		communityStates,
		searchQuery,
		hasTopBar,
		hasSidebar,
		hasCbar,
		visibleLeftPane,
		visibleRightPane,
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
		openChatPane,
		closeChatPane,
		toggleChatPane,
		clearPanes,
		checkBackdrop,
		hideShell,
		showShell,
		setHasContentSidebar,
		incrementUnreadActivityCount,
		setUnreadActivityCount,
		setHasUnreadNotifications,
		setHasNewFriendRequests,
		joinCommunity,
		leaveCommunity,
		setActiveCommunity,
		clearActiveCommunity,
		viewCommunity,
		getQuestStore,
		stickerStore,
	});
}
