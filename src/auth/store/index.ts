import Vue from 'vue';
import Vuex from 'vuex';

import { appStore } from '../../lib/gj-lib-client/vue/services/app/app-store';
import { MediaItem } from '../../lib/gj-lib-client/components/media-item/media-item-model';
import { Api } from '../../lib/gj-lib-client/components/api/api.service';

Vue.use( Vuex );

export const Mutations = {
	showCoverImage: 'showCoverImage',
	hideCoverImage: 'hideCoverImage',
	bootstrap: 'bootstrap',
	setCredentials: 'setCredentials',
};

export const Actions = {
	bootstrap: 'bootstrap',
};

export class StoreState
{
	shouldShowCoverImage = true;
	coverMediaItem?: MediaItem = undefined;

	// We store these when they sign up so that we can log them in
	// once they authorize their account.
	credentials: any = {};
}

export type Store = Vuex.Store<StoreState>;

export const store = new Vuex.Store<StoreState>( {
	state: new StoreState(),
	modules: {
		app: appStore,
	},
	mutations: {
		[Mutations.showCoverImage]: state => state.shouldShowCoverImage = true,
		[Mutations.hideCoverImage]: state => state.shouldShowCoverImage = false,

		[Mutations.bootstrap]( state, payload: any )
		{
			if ( payload.mediaItem ) {
				state.coverMediaItem = new MediaItem( payload.mediaItem );
			}
		},

		[Mutations.setCredentials]( state, credentials: any )
		{
			state.credentials = credentials;
		},
	},
	actions: {
		async [Actions.bootstrap]( { commit } )
		{
			const payload = await Api.sendRequest( '/web/auth/get-customized-page' );
			commit( Mutations.bootstrap, payload );
		},
	}
} );
