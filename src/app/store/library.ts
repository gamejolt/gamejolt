import Vuex from 'vuex';
import { GameCollection } from '../components/game/collection/collection.model';
import { Translate } from '../../lib/gj-lib-client/components/translate/translate.service';

class GamePlaylistFolder
{
	constructor(
		public title: string,
		public collections: GameCollection[],
	)
	{
	}
}

export class LibraryState
{
	static readonly Mutations = {
		bootstrap: 'bootstrap',
		clear: 'clear',
		addCollection: 'addCollection',
		removeCollection: 'removeCollection',
	};

	static readonly Actions = {
		followCollection: 'followCollection',
		unfollowCollection: 'unfollowCollection',
	};

	collections: GameCollection[] = [];
	followedCollection?: GameCollection = undefined;
	developerCollection?: GameCollection = undefined;
	ownedCollection?: GameCollection = undefined;
	recommendedCollection?: GameCollection = undefined;
	bundleCollections: GameCollection[] = [];
}

export const libraryStore: Vuex.Module<LibraryState, any> = {
	state: new LibraryState(),
	namespaced: true,
	getters: {

		/**
		 * These are their followed developer playlists.
		 */
		developerPlaylists( state )
		{
			return state.collections.filter( ( item ) =>
			{
				return item.type === 'developer';
			} );
		},

		/**
		 * These are playlists that don't belong to a folder.
		 */
		mainPlaylists( state )
		{
			return state.collections.filter( ( item ) =>
			{
				return item.type !== 'developer';
			} );
		},

		/**
		 * Returns a list of folders for their playlists.
		 */
		playlistFolders( _state, getters )
		{
			const folders: { [k: string]: GamePlaylistFolder } = {};

			folders.main = new GamePlaylistFolder(
				'',
				getters.mainPlaylists,
			);

			const developerPlaylists: GameCollection[] = getters.developerPlaylists;
			if ( developerPlaylists.length ) {
				folders.developers = new GamePlaylistFolder(
					Translate.$gettext( 'Followed Developers' ),
					developerPlaylists,
				);
			}

			return folders;
		},
	},
	mutations: {
		[LibraryState.Mutations.bootstrap]( state, payload: any )
		{
			state.collections = GameCollection.populate( payload.collections );
			state.followedCollection = payload.followedCollection
				? new GameCollection( payload.followedCollection )
				: undefined;
			state.developerCollection = payload.developerCollection
				? new GameCollection( payload.developerCollection )
				: undefined;
			state.ownedCollection = payload.ownedCollection
				? new GameCollection( payload.ownedCollection )
				: undefined;
			state.recommendedCollection = payload.recommendedCollection
				? new GameCollection( payload.recommendedCollection )
				: undefined;
			state.bundleCollections = GameCollection.populate( payload.bundleCollections );
		},

		[LibraryState.Mutations.clear]( state )
		{
			state.collections = [];
			state.followedCollection = undefined;
			state.developerCollection = undefined;
			state.ownedCollection = undefined;
			state.recommendedCollection = undefined;
			state.bundleCollections = [];
		},

		[LibraryState.Mutations.addCollection]( state, collection: GameCollection )
		{
			state.collections.push( collection );
		},

		[LibraryState.Mutations.removeCollection]( state, collection: GameCollection )
		{
			const index = state.collections.findIndex( ( i ) => i._id === collection._id );
			state.collections.splice( index, 1 );
		},
	},
	actions: {
		async [LibraryState.Actions.followCollection]( store, collection: GameCollection )
		{
			await collection.$follow();
			store.commit( LibraryState.Mutations.addCollection, collection );
		},

		async [LibraryState.Actions.unfollowCollection]( store, collection: GameCollection )
		{
			await collection.$unfollow();
			store.commit( LibraryState.Mutations.removeCollection, collection );
		},
	},
};
