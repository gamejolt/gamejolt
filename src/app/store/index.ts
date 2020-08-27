import { Route } from 'vue-router';
import { sync } from 'vuex-router-sync';
import { VuexAction, VuexModule, VuexMutation, VuexStore } from '../../utils/vuex';
import { Api } from '../../_common/api/api.service';
import { Backdrop } from '../../_common/backdrop/backdrop.service';
import AppBackdrop from '../../_common/backdrop/backdrop.vue';
import {
	CommentActions,
	CommentMutations,
	CommentStore,
} from '../../_common/comment/comment-store';
import {
	$joinCommunity,
	$leaveCommunity,
	Community,
} from '../../_common/community/community.model';
import { Connection } from '../../_common/connection/connection-service';
import { ContentFocus } from '../../_common/content-focus/content-focus.service';
import { FiresidePost } from '../../_common/fireside/post/post-model';
import { Growls } from '../../_common/growls/growls.service';
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
	CommentActions &
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
		joinCommunity: Community;
		leaveCommunity: Community;
	};

export type Mutations = AppMutations &
	ThemeMutations &
	LibraryMutations &
	BannerMutations &
	CommentMutations &
	SidebarMutations &
	_ClientLibraryMod.Mutations & {
		showShell: void;
		hideShell: void;
		setHasContentSidebar: boolean;
		setNotificationCount: { type: UnreadItemType; count: number };
		incrementNotificationCount: { type: UnreadItemType; count: number };
		setFriendRequestCount: number;
		changeFriendRequestCount: number;
		setActiveCommunity: Community;
		clearActiveCommunity: void;
		viewCommunity: Community;
		featuredPost: FiresidePost;
	};

let bootstrapResolver: (() => void) | null = null;
let backdrop: AppBackdrop | null = null;
export let tillStoreBootstrapped = new Promise(resolve => (bootstrapResolver = resolve));

const modules: any = {
	app: appStore,
	theme: new ThemeStore(),
	library: new LibraryStore(),
	banner: new BannerStore(),
	comment: new CommentStore(),
	sidebar: new SidebarStore(),
};

if (GJ_IS_CLIENT) {
	const m: typeof _ClientLibraryMod = require('./client-library');
	modules.clientLibrary = new m.ClientLibraryStore();
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
	comment!: CommentStore;
	sidebar!: SidebarStore;
	clientLibrary!: _ClientLibraryMod.ClientLibraryStore;

	/** From the vuex-router-sync. */
	route!: Route;

	grid: GridClient | null = null;

	isBootstrapped = false;
	isLibraryBootstrapped = false;
	isShellBootstrapped = false;
	isShellHidden = false;

	/** Unread items in the activity feed. */
	unreadActivityCount = 0;
	/** Unread items in the notification feed. */
	unreadNotificationsCount = 0;
	friendRequestCount = 0;
	notificationState: ActivityFeedState | null = null;

	mobileCbarShowing = false;
	private overlayedLeftPane: TogglableLeftPane = '';
	private overlayedRightPane = '';
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
		if (this.isShellHidden) {
			return false;
		}

		// The cbar is pretty empty without a user and active context pane,
		// so we want to hide it if those conditions are met.
		if (!this.app.user && !this.sidebar.activeContextPane) {
			return false;
		}

		return this.mobileCbarShowing || !Screen.isXs;
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

		if (!GJ_IS_CLIENT && !GJ_IS_SSR) {
			BroadcastModal.check();
		}
	}

	@VuexAction
	async logout() {
		const result = await ModalConfirm.show(
			Translate.$gettext('Are you seriously going to leave us?'),
			Translate.$gettext('Logout?'),
			'yes'
		);

		if (!result) {
			return;
		}

		// Must send POST.
		// This should clear out the user as well.
		await Api.sendRequest('/web/dash/account/logout', {});

		// We go to the homepage currently just in case they're in a view they shouldn't be.
		router.push({ name: 'discover.home' });

		Growls.success(
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
			this._toggleLeftPane(this.sidebar.activeContextPane ? 'context' : 'library');
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
			backdrop!.$on('clicked', () => {
				this._clearPanes();
				this.checkBackdrop();
			});
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
	setFriendRequestCount(amount: Mutations['setFriendRequestCount']) {
		this.friendRequestCount = amount;
	}

	@VuexMutation
	changeFriendRequestCount(amount: Mutations['changeFriendRequestCount']) {
		this.friendRequestCount += amount;
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
	async joinCommunity(community: Actions['joinCommunity']) {
		if (community._removed) {
			return;
		}

		if (!community.is_member) {
			await $joinCommunity(community);
		}

		if (this.grid) {
			await this.grid.joinCommunity(community);
		}

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
	async leaveCommunity(community: Actions['leaveCommunity']) {
		if (community.is_member && !community._removed) {
			await $leaveCommunity(community);
		}

		if (this.grid) {
			await this.grid.leaveCommunity(community);
		}

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
		communityState.unreadFeatureCount = 0;

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

		Backdrop.remove(backdrop);
		backdrop = null;
	}
}

export const store = new Store();

// Sync the routes into the store.
sync(store, router, { moduleName: 'route' });

// Sync with the ContentFocus service.
ContentFocus.registerWatcher(() => !store.state.visibleLeftPane && !store.state.visibleRightPane);

// If we were offline, but we're online now, make sure our library is bootstrapped. Remember we
// always have an app user even if we were offline.
if (GJ_IS_CLIENT) {
	store.watch(
		() => Connection.isOffline,
		(isOffline, prev) => {
			if (!isOffline && prev === true) {
				store.dispatch('bootstrap');
			}
		}
	);
}
