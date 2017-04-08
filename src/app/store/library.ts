import Vuex from 'vuex';
import { GameCollection } from '../components/game/collection/collection.model';

export class LibraryState
{
	static readonly Mutations = {
		bootstrap: 'library/bootstrap',
		clear: 'library/clear',
		addCollection: 'library/addCollection',
		removeCollection: 'library/removeCollection',
	};

	static readonly Actions = {
		followCollection: 'library/followCollection',
		unfollowCollection: 'library/unfollowCollection',
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
