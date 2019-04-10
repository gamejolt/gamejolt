import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Backdrop } from 'game-jolt-frontend-lib/components/backdrop/backdrop.service';
import AppBackdrop from 'game-jolt-frontend-lib/components/backdrop/backdrop.vue';
import { CommentActions, CommentMutations, CommentStore } from 'game-jolt-frontend-lib/components/comment/comment-store';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import { Connection } from 'game-jolt-frontend-lib/components/connection/connection-service';
import { ContentFocus } from 'game-jolt-frontend-lib/components/content-focus/content-focus.service';
import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import { ModalConfirm } from 'game-jolt-frontend-lib/components/modal/confirm/confirm-service';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { ThemeActions, ThemeMutations, ThemeStore } from 'game-jolt-frontend-lib/components/theme/theme.store';
import { Translate } from 'game-jolt-frontend-lib/components/translate/translate.service';
import { VuexAction, VuexModule, VuexMutation, VuexStore } from 'game-jolt-frontend-lib/utils/vuex';
import { Actions as AppActions, AppStore, appStore, Mutations as AppMutations } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import { Route } from 'vue-router';
import { sync } from 'vuex-router-sync';
import { ActivityFeedState } from '../components/activity/feed/state';
import { BroadcastModal } from '../components/broadcast-modal/broadcast-modal.service';
import { ChatClient } from '../components/chat/client';
import { GridClient } from '../components/grid/client.service';
import { ChatClientLazy, GridClientLazy } from '../components/lazy';
import { router } from '../views';
import { BannerActions, BannerMutations, BannerStore } from './banner';
import * as _ClientLibraryMod from './client-library';
import { Actions as LibraryActions, LibraryStore, Mutations as LibraryMutations } from './library';

// Re-export our sub-modules.
export { BannerModule, BannerStore } from './banner';

export type Actions = AppActions &
	ThemeActions &
	LibraryActions &
	BannerActions &
	CommentActions &
	_ClientLibraryMod.Actions & {
		bootstrap: void;
		logout: void;
		clear: void;
		loadChat: void;
		clearChat: void;
		loadGrid: void;
		clearGrid: void;
		loadNotificationState: void;
		clearNotificationState: void;
		markNotificationsAsRead: void;
		toggleLeftPane: void;
		toggleRightPane: void;
		clearPanes: void;
	};

export type Mutations = AppMutations &
	ThemeMutations &
	LibraryMutations &
	BannerMutations &
	CommentMutations &
	_ClientLibraryMod.Mutations & {
		setNotificationCount: { type: UnreadItemType; count: number };
		incrementNotificationCount: { type: UnreadItemType; count: number };
		setFriendRequestCount: number;
		changeFriendRequestCount: number;
		joinCommunity: Community;
		leaveCommunity: Community;
		viewCommunity: Community;
	};

let bootstrapResolver: Function | null = null;
let backdrop: AppBackdrop | null = null;
export let tillStoreBootstrapped = new Promise(resolve => (bootstrapResolver = resolve));

const modules: any = {
	app: appStore,
	theme: new ThemeStore(),
	library: new LibraryStore(),
	banner: new BannerStore(),
	comment: new CommentStore(),
};

if (GJ_IS_CLIENT) {
	const m: typeof _ClientLibraryMod = require('./client-library');
	modules.clientLibrary = new m.ClientLibraryStore();
}

// the two types an event notification can assume, either "activity" for the post activity feed or "notifications"
export type UnreadItemType = 'activity' | 'notifications';

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
	clientLibrary!: _ClientLibraryMod.ClientLibraryStore;

	// From the vuex-router-sync.
	route!: Route;

	chat: ChatClient | null = null;
	grid: GridClient | null = null;

	isBootstrapped = false;
	isLibraryBootstrapped = false;
	isShellBootstrapped = false;

	unreadActivityCount = 0; // unread items in the activity feed
	unreadNotificationsCount = 0; // unread items in the notification feed
	friendRequestCount = 0;
	notificationState: ActivityFeedState | null = null;

	isLeftPaneOverlayed = false;
	isRightPaneOverlayed = false;

	communities: Community[] = [];

	get hasSidebar() {
		return Screen.isXs || !!this.app.user;
	}

	get hasCbar() {
		return !Screen.isXs && this.communities.length;
	}

	get isLeftPaneVisible() {
		return this.isLeftPaneOverlayed;
	}

	get isRightPaneVisible() {
		return this.isRightPaneOverlayed;
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
	async loadChat() {
		const ChatClient_ = await ChatClientLazy();
		this._setChat(new ChatClient_());
	}

	@VuexAction
	async clearChat() {
		// Log out of chat. This will notify other tabs to disconnect from the server too.
		if (this.chat) {
			this.chat.logout();
		}

		this._setChat(null);
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

	@VuexAction
	async toggleLeftPane() {
		this._toggleLeftPane();
		this._checkBackdrop();
	}

	@VuexAction
	async toggleRightPane() {
		this._toggleRightPane();
		this._checkBackdrop();
	}

	@VuexAction
	async clearPanes() {
		this._clearPanes();
		this._checkBackdrop();
	}

	@VuexAction
	private async _checkBackdrop() {
		if (this.isRightPaneOverlayed || this.isLeftPaneOverlayed) {
			if (backdrop) {
				return;
			}

			this._addBackdrop();
			backdrop!.$on('clicked', () => {
				this._clearPanes();
				this._checkBackdrop();
			});
		} else if (backdrop) {
			this._removeBackdrop();
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

	@VuexMutation
	joinCommunity(community: Mutations['joinCommunity']) {
		if (this.communities.find(c => c.id === community.id)) {
			return;
		}

		this.communities.unshift(community);
	}

	@VuexMutation
	leaveCommunity(community: Mutations['leaveCommunity']) {
		const idx = this.communities.findIndex(c => c.id === community.id);
		if (idx === -1) {
			return;
		}

		this.communities.splice(idx, 1);
	}

	@VuexMutation
	viewCommunity(community: Mutations['leaveCommunity']) {
		community.is_unread = false;

		const idx = this.communities.findIndex(c => c.id === community.id);
		if (idx === -1) {
			return;
		}

		this.communities.splice(idx, 1);
		this.communities.unshift(community);
	}

	@VuexMutation
	private _setChat(chat: ChatClient | null) {
		this.chat = chat;
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
	private _toggleLeftPane() {
		if (!this.hasSidebar) {
			this.isLeftPaneOverlayed = false;
			return;
		}

		this.isLeftPaneOverlayed = !this.isLeftPaneOverlayed;
		this.isRightPaneOverlayed = false;
	}

	@VuexMutation
	private _toggleRightPane() {
		this.isRightPaneOverlayed = !this.isRightPaneOverlayed;
		this.isLeftPaneOverlayed = false;
	}

	@VuexMutation
	private _clearPanes() {
		this.isRightPaneOverlayed = false;
		this.isLeftPaneOverlayed = false;
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
ContentFocus.registerWatcher(
	() => !store.state.isLeftPaneOverlayed && !store.state.isRightPaneOverlayed
);

// Bootstrap/clear the app when user changes.
store.watch(
	state => state.app.user && state.app.user.id,
	userId => {
		const isLoggedIn = !!userId;

		if (isLoggedIn) {
			store.dispatch('bootstrap');
			if (!GJ_IS_SSR) {
				store.dispatch('loadChat');
				store.dispatch('loadGrid');
				store.dispatch('loadNotificationState');
			}

			if (GJ_IS_CLIENT) {
				store.dispatch('clientLibrary/bootstrap');
			}
		} else {
			store.dispatch('clear');
			store.dispatch('clearChat');
			store.dispatch('clearGrid');
			store.dispatch('clearNotificationState');
		}
	}
);

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
