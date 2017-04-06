import Vue from 'vue';
import Vuex from 'vuex';

import { appStore } from '../../lib/gj-lib-client/vue/services/app/app-store';
import { GameCollection } from '../components/game/collection/collection.model';
import { Settings } from '../components/settings/settings.service';
import { Api } from '../../lib/gj-lib-client/components/api/api.service';
import { Screen } from '../../lib/gj-lib-client/components/screen/screen-service';
import { Chat } from '../components/chat/chat.service';
import { BroadcastModal } from '../components/broadcast-modal/broadcast-modal.service';
import { ModalConfirm } from '../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { Translate } from '../../lib/gj-lib-client/components/translate/translate.service';
import { Growls } from '../../lib/gj-lib-client/components/growls/growls.service';
import { router } from '../bootstrap';
import { AppBackdrop } from '../../lib/gj-lib-client/components/backdrop/backdrop';
import { Backdrop } from '../../lib/gj-lib-client/components/backdrop/backdrop.service';

Vue.use( Vuex );

export const Mutations = {
	clear: 'clear',

	toggleLeftPane: 'toggleLeftPane',
	toggleRightPane: 'toggleRightPane',
	clearPanes: 'clearPanes',
	showBackdrop: 'showBackdrop',
	removeBackdrop: 'removeBackdrop',

	addPlaylist: 'addPlaylist',
	removePlaylist: 'removePlaylist',

	clearChat: 'clearChat',

	setNotificationCount: 'setNotificationCount',
};

export const Actions = {
	bootstrap: 'bootstrap',
	loadChat: 'loadChat',
	logout: 'logout',
	checkBackdrop: 'checkBackdrop',
};

export class StoreState
{
	notificationCount = 0;
	collections: GameCollection[] = [];
	followedCollection?: GameCollection = undefined;
	developerCollection?: GameCollection = undefined;
	ownedCollection?: GameCollection = undefined;
	recommendedCollection?: GameCollection = undefined;
	bundleCollections: GameCollection[] = [];

	isBootstrapped = false;

	isLeftPaneSticky = Settings.get( 'sidebar' ) as boolean;
	isLeftPaneOverlayed = false;
	isRightPaneOverlayed = false;
	backdrop: AppBackdrop | undefined = undefined;

	chat?: typeof Chat = undefined;
}

export type Store = Vuex.Store<StoreState>;

export const store = new Vuex.Store<StoreState>( {
	state: new StoreState(),
	modules: {
		app: appStore,
	},
	getters: {
		isLeftPaneVisible( state )
		{
			if ( Screen.isDesktop ) {
				return state.isLeftPaneSticky;
			}

			return state.isLeftPaneOverlayed;
		},

		isRightPaneVisible( state )
		{
			return state.isRightPaneOverlayed;
		},

		shouldShowLeftPaneBackdrop( state )
		{
			return state.isLeftPaneOverlayed && Screen.isMobile;
		},
	},
	mutations: {
		[Mutations.clear]( state )
		{
			state.collections = [];
			state.followedCollection = undefined;
			state.developerCollection = undefined;
			state.ownedCollection = undefined;
			state.recommendedCollection = undefined;
			state.bundleCollections = [];
		},

		[Mutations.toggleLeftPane]( state )
		{
			if ( Screen.isDesktop ) {
				state.isLeftPaneSticky = !state.isLeftPaneSticky;
			}
			else {
				state.isLeftPaneOverlayed = !state.isLeftPaneOverlayed;
			}

			state.isRightPaneOverlayed = false;
			store.dispatch( Actions.checkBackdrop );
			Settings.set( 'sidebar', state.isLeftPaneSticky );
		},

		[Mutations.toggleRightPane]( state )
		{
			state.isRightPaneOverlayed = !state.isRightPaneOverlayed;
			state.isLeftPaneOverlayed = false;
			store.dispatch( Actions.checkBackdrop );
		},

		[Mutations.clearPanes]( state )
		{
			state.isRightPaneOverlayed = false;
			state.isLeftPaneOverlayed = false;
			store.dispatch( Actions.checkBackdrop );
		},

		[Mutations.addPlaylist]( state, playlist: GameCollection )
		{
			state.collections.push( playlist );
		},

		[Mutations.removePlaylist]( state, playlist: GameCollection )
		{
			const index = state.collections.findIndex( ( i ) => i._id === playlist._id );
			state.collections.splice( index, 1 );
		},

		[Mutations.clearChat]( state )
		{
			// Log out of chat. This will notify other tabs to disconnect from the server too.
			if ( state.chat ) {
				if ( state.chat.client ) {
					state.chat.client.logout();
				}
			}

			state.chat = undefined;
		},

		[Mutations.setNotificationCount]( state, count: number )
		{
			state.notificationCount = count;
		},

		[Mutations.showBackdrop]( state )
		{
			if ( state.backdrop ) {
				return;
			}

			state.backdrop = Backdrop.push( document.getElementById( 'shell-body' ) as HTMLElement );
			state.backdrop.$on( 'clicked', () =>
			{
				store.commit( Mutations.clearPanes );
			} );
		},

		[Mutations.removeBackdrop]( state )
		{
			if ( !state.backdrop ) {
				return;
			}

			Backdrop.remove( state.backdrop );
			state.backdrop = undefined;
		},
	},
	actions: {
		async [Actions.bootstrap]( { state } )
		{
			const response = await Api.sendRequest( '/web/library' );

			state.collections = GameCollection.populate( response.collections );
			state.followedCollection = response.followedCollection
				? new GameCollection( response.followedCollection )
				: undefined;
			state.developerCollection = response.developerCollection
				? new GameCollection( response.developerCollection )
				: undefined;
			state.ownedCollection = response.ownedCollection
				? new GameCollection( response.ownedCollection )
				: undefined;
			state.recommendedCollection = response.recommendedCollection
				? new GameCollection( response.recommendedCollection )
				: undefined;
			state.bundleCollections = GameCollection.populate( response.bundleCollections );

			state.isBootstrapped = true;

			BroadcastModal.check();
		},

		async [Actions.loadChat]( { state } )
		{
			const mod = await $import( '../components/chat/chat.service' );

			state.chat = mod.Chat as typeof Chat;
			state.chat.connect();
		},

		async [Actions.logout]()
		{
			const result = await ModalConfirm.show(
				Translate.$gettext( 'Are you seriously going to leave us?' ),
				Translate.$gettext( 'Logout?' ),
				'yes',
			);

			if ( !result ) {
				return;
			}

			// Must send POST.
			// This should clear out the user as well.
			await Api.sendRequest( '/web/dash/account/logout', {} );

			// We go to the homepage currently just in case they're in a view they shouldn't be.
			router.push( { name: 'discover.home' } );

			Growls.success(
				Translate.$gettext( 'You are now logged out.' ),
				Translate.$gettext( 'Goodbye!' ),
			);
		},

		[Actions.checkBackdrop]( { state } )
		{
			// Ensure we have a backdrop if anything is overlayed.
			// Otherwise ensure the backdrop is gone.
			if ( state.isRightPaneOverlayed || store.getters.shouldShowLeftPaneBackdrop ) {
				if ( state.backdrop ) {
					return;
				}

				store.commit( Mutations.showBackdrop );
			}
			else if ( state.backdrop ) {
				store.commit( Mutations.removeBackdrop );
			}
		},
	},
} );
