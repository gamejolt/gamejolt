import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { router } from '../bootstrap';
import { GameCollection } from '../components/game/collection/collection.model';
import { Analytics } from '../../lib/gj-lib-client/components/analytics/analytics.service';
import { GamePlaylistSaveModal } from '../components/game-playlist/save-modal/save-modal.service';
import { Scroll } from '../../lib/gj-lib-client/components/scroll/scroll.service';
import { ModalConfirm } from '../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { Growls } from '../../lib/gj-lib-client/components/growls/growls.service';
import { Game } from '../../lib/gj-lib-client/components/game/game.model';
import { GamePlaylist } from '../../lib/gj-lib-client/components/game-playlist/game-playlist.model';

class GamePlaylistFolder
{
	constructor(
		public title: string,
		public collections: GameCollection[],
	)
	{
	}
}

@Component({})
export class LibraryState extends Vue
{
	collections: GameCollection[] = [];
	followedCollection: GameCollection | null = null;
	developerCollection: GameCollection | null = null;
	ownedCollection: GameCollection | null = null;
	recommendedCollection: GameCollection | null = null;
	bundleCollections: GameCollection[] = [];

	/**
	 * These are their followed developer playlists.
	 */
	get developerPlaylists()
	{
		return this.collections.filter( ( item ) =>
		{
			return item.type === 'developer';
		} );
	}

	/**
	 * These are playlists that don't belong to a folder.
	 */
	get mainPlaylists()
	{
		return this.collections.filter( ( item ) =>
		{
			return item.type !== 'developer';
		} );
	}

	/**
	 * Returns a list of folders for their playlists.
	 */
	get playlistFolders()
	{
		const folders: { [k: string]: GamePlaylistFolder } = {};

		folders.main = new GamePlaylistFolder(
			'',
			this.mainPlaylists,
		);

		const developerPlaylists: GameCollection[] = this.developerPlaylists;
		if ( developerPlaylists.length ) {
			folders.developers = new GamePlaylistFolder(
				this.$gettext( 'Followed Developers' ),
				developerPlaylists,
			);
		}

		return folders;
	}

	private isViewingCollection( collection: GameCollection )
	{
		return router.currentRoute.name === collection.getSref()
			&& router.currentRoute.params.id === (collection as any).id;
	}

	bootstrap( payload: any )
	{
		this.collections = GameCollection.populate( payload.collections );
		this.followedCollection = payload.followedCollection
			? new GameCollection( payload.followedCollection )
			: null;
		this.developerCollection = payload.developerCollection
			? new GameCollection( payload.developerCollection )
			: null;
		this.ownedCollection = payload.ownedCollection
			? new GameCollection( payload.ownedCollection )
			: null;
		this.recommendedCollection = payload.recommendedCollection
			? new GameCollection( payload.recommendedCollection )
			: null;
		this.bundleCollections = GameCollection.populate( payload.bundleCollections );
	}

	clear()
	{
		this.collections = [];
		this.followedCollection = null;
		this.developerCollection = null;
		this.ownedCollection = null;
		this.recommendedCollection = null;
		this.bundleCollections = [];
	}

	addCollection( collection: GameCollection )
	{
		this.collections.push( collection );
	}

	removeCollection( collection: GameCollection )
	{
		const index = this.collections.findIndex( ( item ) => item._id === collection._id );
		if ( index !== -1 ) {
			this.collections.splice( index, 1 );
		}
	}

	async followCollection( collection: GameCollection )
	{
		await collection.$follow();
		this.addCollection( collection );
	}

	async unfollowCollection( collection: GameCollection )
	{
		await collection.$unfollow();
		this.removeCollection( collection );
	}

	async newPlaylist()
	{
		Analytics.trackEvent( 'add-to-playlist', 'new-playlist' );

		const collection = await GamePlaylistSaveModal.show();
		if ( collection ) {
			this.addCollection( collection );
			Analytics.trackEvent( 'add-to-playlist', 'new-playlist-complete' );
		}

		return collection;
	}

	async editPlaylist( collection: GameCollection )
	{
		// If we're viewing the playlist we're editing, we want to sync the
		// new URL after.
		let syncUrlAfter = this.isViewingCollection( collection );

		if ( await GamePlaylistSaveModal.show( collection ) ) {
			if ( syncUrlAfter ) {
				Scroll.shouldAutoScroll = false;
				router.replace( collection.routeLocation );
			}
		}
	}

	async removePlaylist( collection: GameCollection )
	{
		if ( !collection.playlist ) {
			throw new Error( `Collection isn't a playlist.` );
		}

		const result = await ModalConfirm.show(
			collection.isOwner
				? this.$gettext( `Are you sure you want to remove this playlist?` )
				: this.$gettext( `Are you sure you want to unfollow this playlist?` ),
		);

		if ( !result ) {
			return false;
		}

		try {
			await collection.playlist.$remove();
			this.removeCollection( collection );

			// If they're currently on the playlist page, let's push them to
			// the library instead.
			if ( this.isViewingCollection( collection ) ) {

				router.replace( { name: 'library.overview' } );

				Growls.success(
					this.$gettextInterpolate(
						collection.isOwner
							? this.$gettext( `%{ playlist } has been removed.` )
							: this.$gettext( `You have unfollowed %{ playlist }.` ),
						{ playlist: collection.name },
					),
					this.$gettext(
						collection.isOwner
							? this.$gettext( `Playlist Removed` )
							: this.$gettext( `Playlist Unfollowed` ),
					),
				);

				return true;
			}
		}
		catch ( e ) {
			Growls.error(
				this.$gettext( `Error! Error! Unable to unfollow this playlist.` ),
			);
		}

		return false;
	}

	async addGameToPlaylist( playlist: GamePlaylist, game: Game )
	{
		try {
			await playlist.$addGame( game.id );

			Growls.success(
				this.$gettextInterpolate(
					`You've added %{ game } to %{ playlist }. Nice!`,
					{ game: game.title, playlist: playlist.name },
				),
				this.$gettext( `Added Game` ),
			);

			return true;
		}
		catch ( e ) {
			Growls.error(
				this.$gettext( `Error! Error! This game could not be added to the playlist.` ),
			);
		}

		return false;
	}

	async removeGameFromPlaylist(
		playlist: GamePlaylist,
		game: Game,
		options: { shouldConfirm?: boolean } = {},
	)
	{
		if ( !playlist ) {
			throw new Error( `Invalid collection passed in.` );
		}

		if ( options.shouldConfirm ) {
			const result = await ModalConfirm.show(
				this.$gettext( 'library.playlists.remove_game_confirmation' ),
			);

			if ( !result ) {
				return false;
			}
		}

		try {
			await playlist.$removeGame( game.id );

			Growls.success(
				this.$gettextInterpolate(
					`You have successfully removed %{ game } from %{ playlist }.`,
					{ game: game.title, playlist: playlist.name },
				),
				this.$gettext( `Removed Game` ),
			);

			return true;
		}
		catch ( e ) {
			Growls.error(
				this.$gettext( `Error! Error! This game could not be removed from the playlist.` ),
			);
		}

		return false;
	}

	async unfollowGame( game: Game )
	{
		const result = await ModalConfirm.show(
			this.$gettextInterpolate(
				`Are you sure you want to stop following %{ game }?`,
				{ game: game.title },
			),
		);

		if ( !result ) {
			return false;
		}

		try {
			await game.$unfollow();

			Growls.success(
				this.$gettextInterpolate(
					`You have stopped following %{ game } and will no longer receive notifications about it.`,
					{ game: game.title },
				),
				this.$gettext( `Game Unfollowed` ),
			);

			return true;
		}
		catch ( e ) {
			Growls.error(
				this.$gettext( `Uh-oh, something has prevented you from unfollowing this game.` ),
			);
		}

		return false;
	}
}
