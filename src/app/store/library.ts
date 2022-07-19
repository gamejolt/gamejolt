import { computed, inject, InjectionKey, Ref, ref } from 'vue';
import { Router } from 'vue-router';
import { arrayRemove } from '../../utils/array';
import { trackGameFollow } from '../../_common/analytics/analytics.service';
import { GamePlaylist } from '../../_common/game-playlist/game-playlist.model';
import { Game, unfollowGame } from '../../_common/game/game.model';
import { showErrorGrowl, showSuccessGrowl } from '../../_common/growls/growls.service';
import { ModalConfirm } from '../../_common/modal/confirm/confirm-service';
import { Scroll } from '../../_common/scroll/scroll.service';
import { $gettext, $gettextInterpolate } from '../../_common/translate/translate.service';
import { GamePlaylistSaveModal } from '../components/game-playlist/save-modal/save-modal.service';
import { GameCollection } from '../components/game/collection/collection.model';
import { router } from '../views';

export const LibraryStoreKey: InjectionKey<LibraryStore> = Symbol('library-store');

export type LibraryStore = ReturnType<typeof createLibraryStore>;

export function useLibraryStore() {
	return inject(LibraryStoreKey)!;
}

class GamePlaylistFolder {
	constructor(public title: string, public collections: Ref<GameCollection[]>) {}
}

function _isViewingCollection(router: Router, collection: GameCollection) {
	return (
		router.currentRoute.value.name === collection.routeLocation.name &&
		router.currentRoute.value.params.id === (collection as any).id
	);
}

export function createLibraryStore({ router }: { router: Router }) {
	const _router = router;

	const collections = ref<GameCollection[]>([]);
	const followedCollection = ref<GameCollection>();
	const developerCollection = ref<GameCollection>();
	const ownedCollection = ref<GameCollection>();

	/**
	 * These are their followed developer playlists.
	 */
	const developerPlaylists = computed(() =>
		collections.value.filter(item => item.type === GameCollection.TYPE_DEVELOPER)
	);

	/**
	 * These are their followed jams.
	 */
	const jamPlaylists = computed(() =>
		collections.value.filter(item => item.type === GameCollection.TYPE_JAM)
	);

	/**
	 * These are playlists that don't belong to a folder.
	 */
	const mainPlaylists = computed(() =>
		collections.value.filter(
			item =>
				item.type !== GameCollection.TYPE_DEVELOPER && item.type !== GameCollection.TYPE_JAM
		)
	);

	/**
	 * Returns a list of folders for their playlists.
	 */
	const playlistFolders = computed(() => {
		const folders: Record<string, GamePlaylistFolder> = {};

		folders.main = new GamePlaylistFolder('', mainPlaylists);

		if (developerPlaylists.value.length) {
			folders.developers = new GamePlaylistFolder(
				$gettext('Followed Developers'),
				developerPlaylists
			);
		}

		if (jamPlaylists.value.length) {
			folders.jams = new GamePlaylistFolder($gettext('Followed Jams'), jamPlaylists);
		}

		return folders;
	});

	function bootstrap(payload: any) {
		collections.value = GameCollection.populate(payload.collections);
		followedCollection.value = payload.followedCollection
			? new GameCollection(payload.followedCollection)
			: undefined;
		developerCollection.value = payload.developerCollection
			? new GameCollection(payload.developerCollection)
			: undefined;
		ownedCollection.value = payload.ownedCollection
			? new GameCollection(payload.ownedCollection)
			: undefined;
	}

	function clear() {
		collections.value = [];
		followedCollection.value = undefined;
		developerCollection.value = undefined;
		ownedCollection.value = undefined;
	}

	function addCollection(collection: GameCollection) {
		collections.value.push(collection);
	}

	function removeCollection(collection: GameCollection) {
		arrayRemove(collections.value, i => i._id === collection._id);
	}

	return {
		collections,
		followedCollection,
		developerCollection,
		ownedCollection,
		developerPlaylists,
		jamPlaylists,
		mainPlaylists,
		playlistFolders,
		bootstrap,
		clear,
		addCollection,
		removeCollection,

		_router,
	};
}

export async function libraryFollowCollection(store: LibraryStore, collection: GameCollection) {
	store.addCollection(collection);

	try {
		await collection.$follow();
	} catch (e) {
		store.removeCollection(collection);
		throw e;
	}
}

export async function libraryUnfollowCollection(store: LibraryStore, collection: GameCollection) {
	store.removeCollection(collection);

	try {
		await collection.$unfollow();
	} catch (e) {
		store.addCollection(collection);
		throw e;
	}
}

export async function libraryNewPlaylist(store: LibraryStore) {
	const collection = await GamePlaylistSaveModal.show();
	if (collection) {
		store.addCollection(collection);
	}

	return collection;
}

export async function libraryEditPlaylist(store: LibraryStore, collection: GameCollection) {
	// If we're viewing the playlist we're editing, we want to sync the new
	// URL after.
	const syncUrlAfter = _isViewingCollection(store._router, collection);

	if (await GamePlaylistSaveModal.show(collection)) {
		if (syncUrlAfter) {
			Scroll.shouldAutoScroll = false;
			router.replace(collection.routeLocation);
		}
	}
}

export async function libraryRemovePlaylist(store: LibraryStore, collection: GameCollection) {
	if (!collection.playlist) {
		throw new Error(`Collection isn't a playlist.`);
	}

	const result = await ModalConfirm.show(
		collection.isOwner
			? $gettext(`Are you sure you want to remove this playlist?`)
			: $gettext(`Are you sure you want to unfollow this playlist?`)
	);

	if (!result) {
		return false;
	}

	try {
		await collection.playlist.$remove();
		store.removeCollection(collection);

		// If they're currently on the playlist page, let's push them to
		// the library instead.
		if (_isViewingCollection(store._router, collection)) {
			router.replace({ name: 'library.overview' });

			showSuccessGrowl(
				$gettextInterpolate(
					collection.isOwner
						? $gettext(`%{ playlist } has been removed.`)
						: $gettext(`You have unfollowed %{ playlist }.`),
					{ playlist: collection.name }
				),
				$gettext(
					collection.isOwner
						? $gettext(`Playlist Removed`)
						: $gettext(`Playlist Unfollowed`)
				)
			);

			return true;
		}
	} catch (e) {
		showErrorGrowl($gettext(`Error! Error! Unable to unfollow this playlist.`));
	}

	return false;
}

export async function libraryAddGameToPlaylist(
	_store: LibraryStore,
	playlist: GamePlaylist,
	game: Game
) {
	try {
		await playlist.$addGame(game.id);

		showSuccessGrowl(
			$gettextInterpolate(`You've added %{ game } to %{ playlist }. Nice!`, {
				game: game.title,
				playlist: playlist.name,
			}),
			$gettext(`Added Game`)
		);

		return true;
	} catch (e) {
		showErrorGrowl($gettext(`Error! Error! This game could not be added to the playlist.`));
	}

	return false;
}

export async function libraryRemoveGameFromPlaylist(
	_store: LibraryStore,
	playlist: GamePlaylist,
	game: Game,
	options: { shouldConfirm?: boolean } = {}
) {
	if (!playlist) {
		throw new Error(`Invalid collection passed in.`);
	}

	if (options.shouldConfirm) {
		const result = await ModalConfirm.show(
			$gettext('Are you sure you want to remove this game from the playlist?')
		);

		if (!result) {
			return false;
		}
	}

	try {
		await playlist.$removeGame(game.id);

		showSuccessGrowl(
			$gettextInterpolate(`You have successfully removed %{ game } from %{ playlist }.`, {
				game: game.title,
				playlist: playlist.name,
			}),
			$gettext(`Removed Game`)
		);

		return true;
	} catch (e) {
		showErrorGrowl($gettext(`Error! Error! This game could not be removed from the playlist.`));
	}

	return false;
}

export async function libraryUnfollowGame(_store: LibraryStore, game: Game) {
	const result = await ModalConfirm.show(
		$gettextInterpolate(`Are you sure you want to stop following %{ game }?`, {
			game: game.title,
		})
	);

	if (!result) {
		return false;
	}

	let failed = false;
	try {
		await unfollowGame(game);

		showSuccessGrowl(
			$gettextInterpolate(
				`You have stopped following %{ game } and will no longer receive notifications about it.`,
				{ game: game.title }
			),
			$gettext(`Game Unfollowed`)
		);

		return true;
	} catch (e) {
		failed = true;
		showErrorGrowl($gettext(`Uh-oh, something has prevented you from unfollowing this game.`));
	} finally {
		trackGameFollow(false, { failed, location: 'library' });
	}

	return false;
}
