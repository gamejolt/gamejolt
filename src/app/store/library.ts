import Vuex from 'vuex';
import { GameCollection } from '../components/game/collection/collection.model';
import { Translate } from '../../lib/gj-lib-client/components/translate/translate.service';
import { Analytics } from '../../lib/gj-lib-client/components/analytics/analytics.service';
import { GamePlaylistSaveModal } from '../components/game-playlist/save-modal/save-modal.service';
import { ModalConfirm } from '../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { router } from '../bootstrap';
import { Growls } from '../../lib/gj-lib-client/components/growls/growls.service';
import { Scroll } from '../../lib/gj-lib-client/components/scroll/scroll.service';

class GamePlaylistFolder
{
	constructor(
		public title: string,
		public collections: GameCollection[],
	)
	{
	}
}

function isViewingCollection( collection: GameCollection )
{
	return router.currentRoute.name === collection.getSref()
		&& router.currentRoute.params.id === (collection as any).id;
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
		newPlaylist: 'newPlaylist',
		editPlaylist: 'editPlaylist',
		removePlaylist: 'removePlaylist',
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

		async [LibraryState.Actions.newPlaylist]( store )
		{
			Analytics.trackEvent( 'add-to-playlist', 'new-playlist' );

			const collection = await GamePlaylistSaveModal.show();
			if ( collection ) {
				store.commit( LibraryState.Mutations.addCollection, collection );
				Analytics.trackEvent( 'add-to-playlist', 'new-playlist-complete' );
			}

			return collection;
		},

		async [LibraryState.Actions.editPlaylist]( _store, collection: GameCollection )
		{
			// If we're viewing the playlist we're editing, we want to sync the
			// new URL after.
			let syncUrlAfter = isViewingCollection( collection );

			if ( await GamePlaylistSaveModal.show( collection ) ) {

				if ( syncUrlAfter ) {
					Scroll.shouldAutoScroll = false;
					router.push( collection.routeLocation );
				}
			}
		},

		async [LibraryState.Actions.removePlaylist]( store, collection: GameCollection )
		{
			if ( !collection.playlist ) {
				return;
			}

			const result = await ModalConfirm.show(
				Translate.$gettext( 'Are you sure you want to remove this playlist?' ),
			);

			if ( !result ) {
				return;
			}

			try {
				await collection.playlist.$remove();
				store.commit( LibraryState.Mutations.removeCollection, collection );

				// If they're currently on the playlist page, let's push them to
				// the library instead.
				if ( isViewingCollection( collection ) ) {
					router.push( { name: 'library.overview' } );
					Growls.success(
						Translate.$gettextInterpolate(
							'You have successfully unfollowed %{ playlist }.',
							{ playlist: collection.name },
						),
						Translate.$gettext(
							'Playlist Unfollowed',
						),
					);
				}
			}
			catch ( e ) {
				Growls.error(
					Translate.$gettext( 'Error! Error! Unable to unfollow this playlist.' ),
				);
			}
		},
	},
};
