import { RouteLocationNormalized } from 'vue-router';
import { sync } from 'vuex-router-sync';
import { buildUseStore, VuexAction, VuexModule, VuexMutation, VuexStore } from '../../utils/vuex';
import { CommunityJoinLocation } from '../../_common/analytics/analytics.service';
import { Api } from '../../_common/api/api.service';
import { Backdrop, BackdropController } from '../../_common/backdrop/backdrop.service';
import { Community, joinCommunity, leaveCommunity } from '../../_common/community/community.model';
import { Connection } from '../../_common/connection/connection-service';
import {
	ContentFocus,
	registerContentFocusWatcher as registerFocusWatcher,
} from '../../_common/content-focus/content-focus.service';
import { FiresidePost } from '../../_common/fireside/post/post-model';
import { showSuccessGrowl } from '../../_common/growls/growls.service';
import { ModalConfirm } from '../../_common/modal/confirm/confirm-service';
import { Screen } from '../../_common/screen/screen-service';
import {
	SidebarActions,
	SidebarMutations,
	SidebarStore,
} from '../../_common/sidebar/sidebar.store';
import {
	Actions as AppActions,
	AppStore,
	appStore,
	Mutations as AppMutations,
} from '../../_common/store/app-store';
import { ThemeActions, ThemeMutations, ThemeStore } from '../../_common/theme/theme.store';
import { Translate } from '../../_common/translate/translate.service';
import { ActivityFeedState } from '../components/activity/feed/state';
import { BroadcastModal } from '../components/broadcast-modal/broadcast-modal.service';
import { GridClient } from '../components/grid/client.service';
import { GridClientLazy } from '../components/lazy';
import { router } from '../views';
import { BannerActions, BannerMutations, BannerStore } from './banner';
import * as _ClientLibraryMod from './client-library';
import { CommunityStates } from './community-state';
import { Actions as LibraryActions, LibraryStore, Mutations as LibraryMutations } from './library';

// Re-export our sub-modules.
export { BannerModule, BannerStore } from './banner';

export type Actions = AppActions &
	ThemeActions &
	LibraryActions &
	BannerActions &
	SidebarActions &
	_ClientLibraryMod.Actions & {
		bootstrap: void;
		logout: void;
		clear: void;
		loadGrid: void;
		clearGrid: void;
		loadNotificationState: void;
		clearNotificationState: void;
		markNotificationsAsRead: void;
		toggleCbarMenu: void;
		toggleLeftPane: void;
		toggleRightPane: void;
		toggleChatPane: void;
		clearPanes: void;
		joinCommunity: { community: Community; location?: CommunityJoinLocation };
		leaveCommunity: { community: Community; location?: CommunityJoinLocation };
	};

export type Mutations = AppMutations &
	ThemeMutations &
	LibraryMutations &
	BannerMutations &
	SidebarMutations &
	_ClientLibraryMod.Mutations & {
		showShell: void;
		hideShell: void;
		showFooter: void;
		hideFooter: void;
		setHasContentSidebar: boolean;
		setNotificationCount: { type: UnreadItemType; count: number };
		incrementNotificationCount: { type: UnreadItemType; count: number };
		setHasNewFriendRequests: boolean;
		setHasNewUnlockedStickers: boolean;
		setActiveCommunity: Community;
		clearActiveCommunity: void;
		viewCommunity: Community;
		featuredPost: FiresidePost;
	};

let bootstrapResolver: ((value?: any) => void) | null = null;
let backdrop: BackdropController | null = null;
export let tillStoreBootstrapped = new Promise(resolve => (bootstrapResolver = resolve));

let gridBootstrapResolvers: ((client: GridClient) => void)[] = [];
/**
 * Returns a promise that resolves once the Grid client is available.
 */
export function tillGridBootstrapped() {
	return new Promise<GridClient>(resolve => {
		if (store.state.grid) {
			resolve(store.state.grid);
		} else {
			gridBootstrapResolvers.push(resolve);
		}
	});
}

const modules: any = {
	app: appStore,
	theme: new ThemeStore(),
	library: new LibraryStore(),
	banner: new BannerStore(),
	sidebar: new SidebarStore(),
};

if (GJ_IS_DESKTOP_APP) {
	const mod = await import('./client-library');
	modules.clientLibrary = new mod.ClientLibraryStore();
}

// the two types an event notification can assume, either "activity" for the post activity feed or "notifications"
type UnreadItemType = 'activity' | 'notifications';
type TogglableLeftPane = '' | 'chat' | 'context' | 'library';

@VuexModule({
	store: true,
	modules,
})
export class Store extends VuexStore<Store, Actions, Mutations> {
	app!: AppStore;
	theme!: ThemeStore;
	library!: LibraryStore;
	banner!: BannerStore;
	sidebar!: SidebarStore;
	clientLibrary!: _ClientLibraryMod.ClientLibraryStore;

	/** From the vuex-router-sync. */
	route!: RouteLocationNormalized;

	grid: GridClient | null = null;

	isBootstrapped = false;
	isLibraryBootstrapped = false;
	isShellBootstrapped = false;
	isShellHidden = false;
	isFooterHidden = false;

	/** Unread items in the activity feed. */
	unreadActivityCount = 0;
	/** Unread items in the notification feed. */
	unreadNotificationsCount = 0;
	hasNewFriendRequests = false;
	hasNewUnlockedStickers = false;
	notificationState: ActivityFeedState | null = null;

	mobileCbarShowing = false;
	lastOpenLeftPane: Exclude<TogglableLeftPane, 'context'> = 'library';
	overlayedLeftPane: TogglableLeftPane = '';
	overlayedRightPane = '';
	hasContentSidebar = false;

	/** Will be set to the community they're currently viewing (if any). */
	activeCommunity: null | Community = null;
	communities: Community[] = [];
	communityStates: CommunityStates = new CommunityStates();

	get hasTopBar() {
		return !this.isShellHidden;
	}

	get hasSidebar() {
		return !this.isShellHidden;
	}

	get hasCbar() {
		if (this.isShellHidden || this.app.isUserTimedOut) {
			return false;
		}

		// The cbar is pretty empty without a user and active context pane,
		// so we want to hide it if those conditions are met.
		if (!this.app.user && !this.sidebar.activeContextPane && !Screen.isXs) {
			return false;
		}

		return this.mobileCbarShowing || !Screen.isXs;
	}

	get hasFooter() {
		return !this.isFooterHidden;
	}

	/**
	 * Returns the current overlaying pane if there is one.
	 *
	 * Large breakpoint defaults to 'context' on applicable routes.
	 * */
	get visibleLeftPane(): TogglableLeftPane {
		// If there's no other left-pane pane opened, Large breakpoint should
		// always show the 'context' pane if there is a context component set.
		if (Screen.isLg && this.sidebar.activeContextPane && !this.overlayedLeftPane) {
			return 'context';
		}

		return this.overlayedLeftPane;
	}

	get visibleRightPane() {
		return this.overlayedRightPane;
	}

	get notificationCount() {
		return this.unreadActivityCount + this.unreadNotificationsCount;
	}

	@VuexAction
	async bootstrap() {
		const prevResolver = bootstrapResolver;

		// Detach so that errors in it doesn't cause the not found page to show. This is considered
		// a sort of "async" load.
		try {
			const [shellPayload, libraryPayload] = await Promise.all([
				Api.sendRequest('/web/dash/shell', null, { detach: true }),
				Api.sendRequest('/web/library', null, { detach: true }),
			]);

			this._setLibraryBootstrapped();
			this._shellPayload(shellPayload);

			// If we failed to finish before we unbootstrapped, then stop.
			if (bootstrapResolver !== prevResolver) {
				return;
			}

			this.commit('library/bootstrap', libraryPayload);
		} catch (e) {}

		this._setBootstrapped();

		if (!GJ_IS_DESKTOP_APP && !import.meta.env.SSR) {
			BroadcastModal.check();
		}
	}

	@VuexAction
	async logout() {
		const result = await ModalConfirm.show(
			Translate.$gettext('Are you seriously going to leave us?'),
			Translate.$gettext('Logout?')
		);

		if (!result) {
			return;
		}

		// Must send POST.
		// This should clear out the user as well.
		await Api.sendRequest('/web/dash/account/logout', {});

		// We go to the homepage currently just in case they're in a view they shouldn't be.
		router.push({ name: 'discover.home' });

		showSuccessGrowl(
			Translate.$gettext('You are now logged out.'),
			Translate.$gettext('Goodbye!')
		);
	}

	@VuexAction
	async clear() {
		tillStoreBootstrapped = new Promise(resolve => (bootstrapResolver = resolve));
		this.commit('library/clear');
	}

	@VuexAction
	async loadGrid() {
		const GridClient_ = await GridClientLazy();
		this._setGrid(new GridClient_());
	}

	@VuexAction
	async clearGrid() {
		if (this.grid) {
			this.grid.disconnect();
		}

		this._setGrid(null);
	}

	@VuexAction
	async loadNotificationState() {
		const state = new ActivityFeedState({
			type: 'Notification',
			name: 'notification',
			url: `/web/dash/activity/more/notifications`,
		});

		this._setNotificationState(state);
	}

	@VuexAction
	async clearNotificationState() {
		this._setNotificationState(null);
	}

	@VuexAction
	async markNotificationsAsRead() {
		if (!this.notificationState) {
			return;
		}

		// Reset the watermark first so that it happens immediately.
		this._resetNotificationWatermark();
		await Api.sendRequest('/web/dash/activity/mark-all-read', {});
	}

	// This Action is only used for the 'Xs' breakpoint.
	@VuexAction
	async toggleCbarMenu() {
		this._toggleCbarMenu();
		if (this.visibleLeftPane) {
			// Close the left-pane if the cbar is also closing.
			this._toggleLeftPane();
		} else {
			// Open the left-pane depending on the SidebarStore information when the cbar shows.
			this._toggleLeftPane(
				this.sidebar.activeContextPane ? 'context' : this.lastOpenLeftPane
			);
		}

		this.checkBackdrop();
	}

	/** Show the context pane if there's one available. */
	@VuexAction
	async showContextPane() {
		if (this.visibleLeftPane !== 'context' && this.sidebar.activeContextPane) {
			this.toggleLeftPane('context');
		}
	}

	/** Passing no value will close any open left-panes. */
	@VuexAction
	async toggleLeftPane(type?: TogglableLeftPane) {
		if (type === 'context' && !this.sidebar.activeContextPane) {
			// Don't show the context pane if the SidebarStore has no context to show.
			this._toggleLeftPane();
			return;
		}

		this._toggleLeftPane(type);
		this.checkBackdrop();
	}

	@VuexAction
	async toggleRightPane(type?: string) {
		this._toggleRightPane(type);
		this.checkBackdrop();
	}

	@VuexAction
	async toggleChatPane() {
		this._toggleLeftPane('chat');
		this.checkBackdrop();
	}

	@VuexAction
	async clearPanes() {
		this._clearPanes();
		this.checkBackdrop();
	}

	/** Using this will add or remove backdrops as needed for overlaying panes. */
	@VuexAction
	async checkBackdrop() {
		if (
			(!!this.overlayedRightPane || !!this.overlayedLeftPane) &&
			// We only want backdrops on the Lg breakpoint if the pane isn't context.
			!(Screen.isLg && this.overlayedLeftPane === 'context')
		) {
			if (backdrop) {
				return;
			}

			this._addBackdrop();
			backdrop!.onClicked = () => {
				this._clearPanes();
				this.checkBackdrop();
			};
		} else if (backdrop) {
			this._removeBackdrop();
		}
	}

	@VuexMutation
	hideShell() {
		this.isShellHidden = true;
	}

	@VuexMutation
	showShell() {
		this.isShellHidden = false;
	}

	@VuexMutation
	hideFooter() {
		this.isFooterHidden = true;
	}

	@VuexMutation
	showFooter() {
		this.isFooterHidden = false;
	}

	@VuexMutation
	setHasContentSidebar(isShowing: Mutations['setHasContentSidebar']) {
		// We use this to scooch the footer over to make room for the sidebar content, but we only care about
		// that when the sidebar isn't behaving as an overlay - which is currently only on the Lg breakpoint.
		if (Screen.isLg) {
			this.hasContentSidebar = isShowing;
		} else {
			this.hasContentSidebar = false;
		}
	}

	@VuexMutation
	incrementNotificationCount(payload: Mutations['incrementNotificationCount']) {
		if (payload.type === 'activity') {
			this.unreadActivityCount += payload.count;
		} else {
			this.unreadNotificationsCount += payload.count;
		}
	}

	@VuexMutation
	setNotificationCount(payload: Mutations['setNotificationCount']) {
		if (payload.type === 'activity') {
			this.unreadActivityCount = payload.count;
		} else {
			this.unreadNotificationsCount = payload.count;
		}
	}

	@VuexMutation
	setHasNewFriendRequests(has: Mutations['setHasNewFriendRequests']) {
		this.hasNewFriendRequests = has;
	}

	@VuexMutation
	setHasNewUnlockedStickers(has: Mutations['setHasNewUnlockedStickers']) {
		this.hasNewUnlockedStickers = has;
	}

	@VuexMutation
	private _setBootstrapped() {
		this.isBootstrapped = true;
		if (bootstrapResolver) {
			bootstrapResolver();
		}
	}

	@VuexMutation
	private _setLibraryBootstrapped() {
		this.isLibraryBootstrapped = true;
	}

	@VuexMutation
	private _shellPayload(payload: any) {
		this.isShellBootstrapped = true;
		this.communities = Community.populate(payload.communities);
	}

	@VuexAction
	async joinCommunity({ community, location }: Actions['joinCommunity']) {
		if (community._removed) {
			return;
		}

		if (!community.is_member) {
			await joinCommunity(community, location);
		}

		this.grid?.joinCommunity(community);
		this._joinCommunity(community);
	}

	@VuexMutation
	private _joinCommunity(community: Community) {
		if (this.communities.find(c => c.id === community.id)) {
			return;
		}

		this.communities.unshift(community);
	}

	@VuexAction
	async leaveCommunity({ community, location }: Actions['leaveCommunity']) {
		if (community.is_member && !community._removed) {
			await leaveCommunity(community, location);
		}

		this.grid?.leaveCommunity(community);
		this._leaveCommunity(community);
	}

	@VuexMutation
	private _leaveCommunity(community: Community) {
		const communityState = this.communityStates.getCommunityState(community);
		communityState.reset();

		const idx = this.communities.findIndex(c => c.id === community.id);
		if (idx === -1) {
			return;
		}

		this.communities.splice(idx, 1);
	}

	@VuexMutation
	setActiveCommunity(community: Mutations['setActiveCommunity']) {
		this.activeCommunity = community;
	}

	@VuexMutation
	clearActiveCommunity() {
		this.activeCommunity = null;
	}

	@VuexMutation
	viewCommunity(community: Mutations['viewCommunity']) {
		const communityState = this.communityStates.getCommunityState(community);
		communityState.hasUnreadFeaturedPosts = false;

		const idx = this.communities.findIndex(c => c.id === community.id);
		if (idx === -1) {
			return;
		}

		this.communities.splice(idx, 1);
		this.communities.unshift(community);
	}

	@VuexMutation
	featuredPost(post: Mutations['featuredPost']) {
		if (this.grid) {
			this.grid.recordFeaturedPost(post);
		}
	}

	@VuexMutation
	private _setGrid(grid: GridClient | null) {
		if (grid !== null) {
			for (const resolver of gridBootstrapResolvers) {
				resolver(grid);
			}
			gridBootstrapResolvers = [];
		}

		this.grid = grid;
	}

	@VuexMutation
	private _setNotificationState(state: ActivityFeedState | null) {
		this.notificationState = state;
	}

	@VuexMutation
	private _resetNotificationWatermark() {
		// Mark all loaded notifications as read through the feed watermark.
		// It's better than having to reload from the backend.
		if (this.notificationState) {
			this.notificationState.notificationWatermark = Date.now();
		}
	}

	@VuexMutation
	private _toggleCbarMenu() {
		this.mobileCbarShowing = !this.mobileCbarShowing;
	}

	@VuexMutation
	private _toggleLeftPane(type: TogglableLeftPane = '') {
		if (!this.hasSidebar) {
			this.overlayedLeftPane = '';
			return;
		}

		if (this.overlayedLeftPane === type) {
			this.overlayedLeftPane = '';
		} else {
			this.overlayedLeftPane = type;
		}

		if (type && type !== 'context') {
			this.lastOpenLeftPane = type;
		}

		this.mobileCbarShowing = !!this.overlayedLeftPane;
		this.overlayedRightPane = '';
	}

	@VuexMutation
	private _toggleRightPane(type = '') {
		if (this.overlayedRightPane === type) {
			this.overlayedRightPane = '';
		} else {
			this.overlayedRightPane = type;
		}

		this.overlayedLeftPane = '';
	}

	@VuexMutation
	private _clearPanes() {
		this.overlayedRightPane = '';
		this.overlayedLeftPane = '';
		this.mobileCbarShowing = false;
	}

	@VuexMutation
	private _addBackdrop() {
		if (backdrop) {
			return;
		}

		backdrop = Backdrop.push({ context: document.body });
	}

	@VuexMutation
	private _removeBackdrop() {
		if (!backdrop) {
			return;
		}

		backdrop.remove();
		backdrop = null;
	}
}

export const store = new Store();
export const useStore = buildUseStore<Store>();

// Sync the routes into the store.
sync(store, router, { moduleName: 'route' });

// Sync with the ContentFocus service.
registerFocusWatcher(
	ContentFocus,
	// We only care if the panes are overlaying, not if they're visible in the
	// page without overlaying. Example is that context panes show in-page on
	// large displays.
	() => !store.state.overlayedLeftPane && !store.state.overlayedRightPane
);

// If we were offline, but we're online now, make sure our library is bootstrapped. Remember we
// always have an app user even if we were offline.
if (GJ_IS_DESKTOP_APP) {
	store.watch(
		() => Connection.isOffline,
		(isOffline, prev) => {
			if (!isOffline && prev === true) {
				store.dispatch('bootstrap');
			}
		}
	);
}
