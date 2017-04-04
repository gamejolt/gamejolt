import Vue from 'vue';
import Vuex from 'vuex';

import { appStore } from '../../lib/gj-lib-client/vue/services/app/app-store';
import { GameCollection } from '../components/game/collection/collection.model';
import { Settings } from '../components/settings/settings.service';
import { Api } from '../../lib/gj-lib-client/components/api/api.service';
import { Screen } from '../../lib/gj-lib-client/components/screen/screen-service';
import { Chat } from '../components/chat/chat.service';
import { BroadcastModal } from '../components/broadcast-modal/broadcast-modal.service';

Vue.use( Vuex );

export const Mutations = {
	clear: 'clear',

	toggleLeftPane: 'toggleLeftPane',
	toggleRightPane: 'toggleRightPane',

	addPlaylist: 'addPlaylist',
	removePlaylist: 'removePlaylist',

	clearChat: 'clearChat',

	setNotificationCount: 'setNotificationCount',
};

export const Actions = {
	bootstrap: 'bootstrap',
	loadChat: 'loadChat',
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
			// state.checkBackdrop();
			Settings.set( 'sidebar', state.isLeftPaneSticky );
		},

		[Mutations.toggleRightPane]( state )
		{
			state.isRightPaneOverlayed = !state.isRightPaneOverlayed;
			state.isLeftPaneOverlayed = false;
			// state.checkBackdrop();
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
	},
} );
