import Vue from 'vue';
import Vuex from 'vuex';
import { namespace, State, Getter, Mutation, Action } from 'vuex-class';

import { appStore } from '../../lib/gj-lib-client/vue/services/app/app-store';
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
import { libraryStore, LibraryState } from './library';
import { User } from '../../lib/gj-lib-client/components/user/user.model';

Vue.use( Vuex );

// Convenience decorators to call into the library module.
export const StateLibrary = namespace( 'library', State );
export const GetterLibrary = namespace( 'library', Getter );
export const MutationLibrary = namespace( 'library', Mutation );
export const ActionLibrary = namespace( 'library', Action );

export const Mutations = {
	clear: 'clear',

	toggleLeftPane: 'toggleLeftPane',
	toggleRightPane: 'toggleRightPane',
	clearPanes: 'clearPanes',
	showBackdrop: 'showBackdrop',
	removeBackdrop: 'removeBackdrop',

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

	isBootstrapped = false;
	bootstrappedPromise =
		new Promise( ( resolve ) => this._bootstrappedResolver = resolve );
	_bootstrappedResolver: Function;

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
		library: libraryStore,
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
			state.bootstrappedPromise =
				new Promise( ( resolve ) => state._bootstrappedResolver = resolve );

			store.commit( 'library/' + LibraryState.Mutations.clear );
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
		async [Actions.bootstrap]( { state, commit } )
		{
			const prevResolver = state._bootstrappedResolver;
			const response = await Api.sendRequest( '/web/library' );

			// If we failed to finish before we unbootstrapped, then stop.
			if ( state._bootstrappedResolver !== prevResolver ) {
				return;
			}

			commit( 'library/' + LibraryState.Mutations.bootstrap, response );

			state.isBootstrapped = true;
			state._bootstrappedResolver();

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

// Bootstrap/clear the app when user changes.
store.watch(
	( state: any ) => state.app.user,
	( user?: User ) =>
	{
		const isLoggedIn = !!user;

		if ( isLoggedIn ) {
			store.dispatch( Actions.bootstrap );
			store.dispatch( Actions.loadChat );
		}
		else {
			store.commit( Mutations.clear );
			store.commit( Mutations.clearChat );
		}
	},
);
