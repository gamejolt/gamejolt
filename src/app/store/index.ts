import { Route } from 'vue-router';
import { sync } from 'vuex-router-sync';

import { Settings } from '../../_common/settings/settings.service';
import { Api } from '../../lib/gj-lib-client/components/api/api.service';
import { AppBackdrop } from '../../lib/gj-lib-client/components/backdrop/backdrop';
import { Backdrop } from '../../lib/gj-lib-client/components/backdrop/backdrop.service';
import { Growls } from '../../lib/gj-lib-client/components/growls/growls.service';
import { ModalConfirm } from '../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { Screen } from '../../lib/gj-lib-client/components/screen/screen-service';
import { Translate } from '../../lib/gj-lib-client/components/translate/translate.service';
import {
	VuexAction,
	VuexModule,
	VuexMutation,
	VuexStore,
} from '../../lib/gj-lib-client/utils/vuex';
import {
	Actions as AppActions,
	AppStore,
	appStore,
	Mutations as AppMutations,
} from '../../lib/gj-lib-client/vue/services/app/app-store';
import { BroadcastModal } from '../components/broadcast-modal/broadcast-modal.service';
import { ChatClient } from '../components/chat/client';
import { ChatClientLazy } from '../components/lazy';
import { GridClient } from '../components/grid/client.service';
import { GridClientLazy } from '../components/lazy';
import { router } from '../views';
import * as _ClientLibraryMod from './client-library';
import { Actions as LibraryActions, LibraryStore, Mutations as LibraryMutations } from './library';
import { Connection } from '../../lib/gj-lib-client/components/connection/connection-service';
import { BannerStore, BannerMutations, BannerActions } from './banner';
import {
	CommentActions,
	CommentMutations,
	CommentStore,
} from '../../lib/gj-lib-client/components/comment/comment-store';
import {
	ThemeActions,
	ThemeMutations,
	ThemeStore,
} from '../../lib/gj-lib-client/components/theme/theme.store';
import { ContentFocus } from '../../lib/gj-lib-client/components/content-focus/content-focus.service';

export type Actions = AppActions &
	ThemeActions &
	LibraryActions &
	BannerActions &
	CommentActions &
	_ClientLibraryMod.Actions & {
		bootstrap: undefined;
		logout: undefined;
		clear: undefined;
		loadChat: undefined;
		clearChat: undefined;
		loadGrid: undefined;
		clearGrid: undefined;
		toggleLeftPane: undefined;
		toggleRightPane: undefined;
		clearPanes: undefined;
		_checkBackdrop: undefined;
	};

export type Mutations = AppMutations &
	ThemeMutations &
	LibraryMutations &
	BannerMutations &
	CommentMutations &
	_ClientLibraryMod.Mutations & {
		setNotificationCount: number;
		incrementNotificationCount: number;
		setFriendRequestCount: number;
		changeFriendRequestCount: number;
		_setBootstrapped: undefined;
		_setLibraryBootstrapped: undefined;
		_clear: undefined;
		_setChat: ChatClient | null;
		_setGrid: GridClient | null;
		_toggleLeftPane: undefined;
		_toggleRightPane: undefined;
		_clearPanes: undefined;
		_addBackdrop: undefined;
		_removeBackdrop: undefined;
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

	notificationCount = 0;
	friendRequestCount = 0;

	isLeftPaneSticky = Settings.get('sidebar') as boolean;
	isLeftPaneOverlayed = false;
	isRightPaneOverlayed = false;

	get isLeftPaneVisible() {
		if (Screen.isLg) {
			return this.isLeftPaneSticky;
		}

		return this.isLeftPaneOverlayed;
	}

	get isRightPaneVisible() {
		return this.isRightPaneOverlayed;
	}

	get shouldShowLeftPaneBackdrop() {
		return this.isLeftPaneOverlayed && !Screen.isLg;
	}

	get hasSidebar() {
		return Screen.isXs || this.app.user;
	}

	@VuexAction
	async bootstrap() {
		const prevResolver = bootstrapResolver;

		// Detach so that errors in it doesn't cause the not found page to show. This is considered
		// a sort of "async" load.
		try {
			const response = await Api.sendRequest('/web/library', null, { detach: true });
			this._setLibraryBootstrapped();

			// If we failed to finish before we unbootstrapped, then stop.
			if (bootstrapResolver !== prevResolver) {
				return;
			}

			this.commit('library/bootstrap', response);
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
		this._clear();
		this.commit('library/clear');
	}

	@VuexAction
	async loadChat() {
		if (GJ_IS_SSR) {
			return;
		}

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
		if (GJ_IS_SSR) {
			return;
		}

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
	async toggleLeftPane() {
		if (!this.hasSidebar) {
			return;
		}

		this._toggleLeftPane();
		this._checkBackdrop();
		Settings.set('sidebar', this.isLeftPaneSticky);
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
	async _checkBackdrop() {
		// Ensure we have a backdrop if anything is overlayed.
		// Otherwise ensure the backdrop is gone.
		if (this.isRightPaneOverlayed || this.shouldShowLeftPaneBackdrop) {
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
	incrementNotificationCount(amount: Mutations['incrementNotificationCount']) {
		this.notificationCount += amount;
	}

	@VuexMutation
	setNotificationCount(count: Mutations['setNotificationCount']) {
		this.notificationCount = count;
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
	_setBootstrapped() {
		this.isBootstrapped = true;
		if (bootstrapResolver) {
			bootstrapResolver();
		}
	}

	@VuexMutation
	_setLibraryBootstrapped() {
		this.isLibraryBootstrapped = true;
	}

	@VuexMutation
	_clear() {
		tillStoreBootstrapped = new Promise(resolve => (bootstrapResolver = resolve));
	}

	@VuexMutation
	_setChat(chat: Mutations['_setChat']) {
		this.chat = chat;
	}

	@VuexMutation
	_setGrid(grid: Mutations['_setGrid']) {
		this.grid = grid;
	}

	@VuexMutation
	_toggleLeftPane() {
		if (Screen.isLg) {
			this.isLeftPaneSticky = !this.isLeftPaneSticky;
		} else {
			this.isLeftPaneOverlayed = !this.isLeftPaneOverlayed;
		}

		this.isRightPaneOverlayed = false;
	}

	@VuexMutation
	_toggleRightPane() {
		this.isRightPaneOverlayed = !this.isRightPaneOverlayed;
		this.isLeftPaneOverlayed = false;
	}

	@VuexMutation
	_clearPanes() {
		this.isRightPaneOverlayed = false;
		this.isLeftPaneOverlayed = false;
	}

	@VuexMutation
	_addBackdrop() {
		if (backdrop) {
			return;
		}

		backdrop = Backdrop.push({ context: document.body });
	}

	@VuexMutation
	_removeBackdrop() {
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
	() => !store.state.isLeftPaneOverlayed && !store.state.isRightPaneVisible
);

// Bootstrap/clear the app when user changes.
store.watch(
	state => state.app.user && state.app.user.id,
	userId => {
		const isLoggedIn = !!userId;

		if (isLoggedIn) {
			store.dispatch('bootstrap');
			store.dispatch('loadChat');
			store.dispatch('loadGrid');

			if (GJ_IS_CLIENT) {
				store.dispatch('clientLibrary/bootstrap');
			}
		} else {
			store.dispatch('clear');
			store.dispatch('clearChat');
			store.dispatch('clearGrid');
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
