import Vue from 'vue';
import VueRouter from 'vue-router';
import { State } from 'vuex-class';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./collection.html?style=./collection.styl';

import { GameFilteringContainer } from '../../../components/game/filtering/container';
import { GameListingContainer } from '../../../components/game/listing/listing-container-service';
import { BeforeRouteEnter } from '../../../../lib/gj-lib-client/utils/router';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { GameCollection } from '../../../components/game/collection/collection.model';
import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import { AppState } from '../../../../lib/gj-lib-client/vue/services/app/app-store';
import { GamePlaylist } from '../../../../lib/gj-lib-client/components/game-playlist/game-playlist.model';
import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { AppGameListing } from '../../../components/game/listing/listing';
import { AppGameGrid } from '../../../components/game/grid/grid';
import { GameBundle } from '../../../../lib/gj-lib-client/components/game-bundle/game-bundle.model';
import { AppPageHeader } from '../../../components/page-header/page-header';
import { AppGameCollectionThumbnail } from '../../../components/game/collection/thumbnail/thumbnail';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppPopover } from '../../../../lib/gj-lib-client/components/popover/popover';
import { AppAuthRequired } from '../../../../lib/gj-lib-client/components/auth/auth-required-directive.vue';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { AppPopoverTrigger } from '../../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { LibraryState } from '../../../store/library';
import { AppGameCollectionFollowWidget } from '../../../components/game/collection/follow-widget/follow-widget';

@View
@Component({
	components: {
		AppPageHeader,
		AppGameCollectionThumbnail,
		AppJolticon,
		AppPopover,
		AppGameListing,
		AppGameGrid,
		AppGameCollectionFollowWidget,
	},
	directives: {
		AppTooltip,
		AppAuthRequired,
		AppPopoverTrigger,
	},
	filters: {
		number,
	},
})
export default class RouteLibraryCollection extends Vue
{
	@Prop( String ) id: string;

	@State app: AppState;
	@State library: LibraryState;

	type = '';
	followerCount = 0;

	collection: GameCollection | null = null;

	filtering: GameFilteringContainer | null = null;
	listing: GameListingContainer | null = null;

	Screen = makeObservableService( Screen );

	// TODO: Still gotta work on this.
	// Not really able to make this lazy since it needs payload to build out the
	// header.
	@BeforeRouteEnter( { cache: true } )
	routeEnter( this: undefined, route: VueRouter.Route )
	{
		const filtering = new GameFilteringContainer();

		// If initialization changed the URL, then we don't want to do the API call.
		// This prevents a double API call from going out.
		if ( !filtering.init( route ) ) {
			return undefined;
		}

		const query = filtering.getQueryString( route );

		let id: string = route.params.id;
		if ( GameCollection.USER_TYPES.indexOf( route.meta.collectionType ) !== -1 ) {
			id = '@' + id;
		}

		return Api.sendRequest(
			`/web/library/games/${ route.meta.collectionType }/${ id }?${ query }`
		);
	}

	routed()
	{
		// Meta.title = this.pageTitle;

		if ( !this.listing || !this.filtering ) {
			this.filtering = new GameFilteringContainer();
			this.filtering.init( this.$route );

			this.listing = new GameListingContainer( this.filtering );
		}

		this.listing.processPayload( this.$route, this.$payload );

		this.type = this.$route.meta.collectionType;

		// We try pulling a populated collection from the registry.
		// This will be the case if it's in their library.
		// When they don't have it registered in their library, we just make an instance of a new one.
		this.collection = this.library.collections.find(
			( item ) => item.type === this.type && (item as any).id === this.processedId
		) || null;


		if ( !this.collection ) {
			this.collection = new GameCollection( this.$payload.collection );
		}

		this.followerCount = this.$payload.followerCount || 0;

		this.processMeta();

		// // Tag pages don't have slugs.
		// if ( this.type != 'tag' ) {
		// 	Location.enforce( {
		// 		slug: this.collection.slug,
		// 	} );
		// }

		// // Controls on thumbnails.
		// this.thumbnailControl = '';
		// if ( App.user && collectionCtrl.collection.owner && collectionCtrl.collection.owner.id == App.user.id ) {
		// 	if ( collectionCtrl.type == 'playlist' ) {
		// 		this.thumbnailControl = 'remove';
		// 		this.thumbnailControlLabel = this.$gettextInterpolate( 'library.collection.thumbnail_control_playlist_tooltip' );
		// 		this.thumbnailControlAction = this.removeFromPlaylist;
		// 	}
		// 	else if ( collectionCtrl.type == 'followed' ) {
		// 		this.thumbnailControl = 'subscribed';
		// 		this.thumbnailControlLabel = this.$gettextInterpolate( 'library.collection.thumbnail_control_unfollow_tooltip' );
		// 		this.thumbnailControlAction = this.removeFromLibrary;
		// 	}
		// }
	}

	// TODO: Pull the titles in as raw text so interpolations work correctly
	private processMeta()
	{
		if ( this.$payload.metaTitle ) {
			Meta.title = this.$payload.metaTitle;
		}
		else {
			if ( this.type === 'followed' ) {
				const params = { user: '@' + this.user!.username };
				if ( this.isOwner ) {
					Meta.title = this.$gettextInterpolate(
						'Your Followed Games',
						params,
					);
				}
				else {
					Meta.title = this.$gettextInterpolate(
						'Games Followed by %{ user }',
						params,
					);
				}
			}
			else if ( this.type === 'playlist' ) {
				const params = { playlist: this.playlist!.name, user: '@' + this.user!.username };
				if ( this.isOwner ) {
					Meta.title = this.playlist!.name;
				}
				else {
					Meta.title = this.$gettextInterpolate(
						'%{ playlist } by %{ user }',
						params,
					);
				}
			}
			else if ( this.type === 'developer' ) {
				const params = { user: '@' + this.user!.username };
				if ( this.isOwner ) {
					Meta.title = this.$gettextInterpolate(
						'Your Games',
						params,
					);
				}
				else {
					Meta.title = this.$gettextInterpolate(
						'Games by %{ user }',
						params,
					);
				}
			}
			else if ( this.type === 'owned' ) {
				const params = { user: '@' + this.user!.username };
				if ( this.isOwner ) {
					Meta.title = this.$gettext( 'Your Owned Games' );
				}
				else {
					Meta.title = this.$gettextInterpolate(
						'Games Owned by %{ user }',
						params,
					);
				}
			}
			else if ( this.type === 'recommended' ) {
				const params = { user: '@' + this.user!.username };
				if ( this.isOwner ) {
					Meta.title = this.$gettext( 'Your Recommended Games' );
				}
				else {
					Meta.title = this.$gettextInterpolate(
						'Game Recommendations for %{ user }',
						params,
					);
				}
			}
			else if ( this.type === 'bundle' ) {
				Meta.title = this.bundle!.title;
			}
			else if ( this.type === 'tag' ) {
				Meta.title = `#${ this.tag }`;
			}
		}

		if ( this.$payload.metaDescription ) {
			Meta.description = this.$payload.metaDescription;
		}

		if ( this.$payload.fb ) {
			Meta.fb = this.$payload.fb;
			Meta.fb.title = Meta.title;
		}

		if ( this.$payload.twitter ) {
			Meta.twitter = this.$payload.twitter;
			Meta.twitter.title = Meta.title;
		}
	}

	get processedId()
	{
		// Get the collection id.
		let id = this.id;
		if ( GameCollection.USER_TYPES.indexOf( this.type ) !== -1 ) {
			id = '@' + id;
		}

		return id;
	}

	get playlist()
	{
		if ( this.type !== 'playlist' ) {
			return undefined;
		}

		return new GamePlaylist( this.$payload.playlist );
	}

	get bundle()
	{
		if ( this.type !== 'bundle' ) {
			return undefined;
		}

		return new GameBundle( this.$payload.bundle );
	}

	get tag()
	{
		if ( this.type !== 'tag' ) {
			return undefined;
		}

		return this.id;
	}

	get user()
	{
		if ( this.type === 'followed' || this.type === 'owned' || this.type === 'recommended' ) {
			return new User( this.$payload.user );
		}
		else if ( this.type === 'developer' ) {
			return new User( this.$payload.developer );
		}
		else if ( this.playlist ) {
			return this.playlist.user;
		}

		return undefined;
	}

	get isOwner()
	{
		return !!(this.app.user && this.user
			&& this.app.user.id === this.user.id);
	}

	get shouldShowFollow()
	{
		return !this.isOwner;
	}

	// this.showEditPlaylist = function()
	// {
	// 	GamePlaylist_SaveModal.show( this.playlist ).then( function()
	// 	{
	// 		_this.collection.slug = _this.playlist.slug;
	// 		_this.collection.name = _this.playlist.name;

	// 		// Note that we want to replace current URL since technically they didn't go anywhere.
	// 		// We don't want to reload the controller or anything.
	// 		AutoScroll.noScroll( true );
	// 		$state.go( _this.collection.getSref(), _this.collection.getSrefParams(), { notify: false, location: 'replace' } );
	// 	} );
	// };

	// this.removePlaylist = function()
	// {
	// 	ModalConfirm.show( this.$gettextInterpolate( 'library.playlists.remove_playlist_confirmation', { playlist: _this.playlist.name } ) )
	// 		.then( function()
	// 		{
	// 			_this.playlist.$remove().then( function()
	// 			{
	// 				Shell.removePlaylist( _this.collection );
	// 				$state.go( 'library.overview' );
	// 				Growls.success(
	// 					this.$gettextInterpolate( 'library.playlists.remove_playlist_success_growl', { playlist: _this.playlist.name } ),
	// 					this.$gettextInterpolate( 'library.playlists.remove_playlist_success_growl_title', { playlist: _this.playlist.name } )
	// 				);
	// 			} )
	// 			.catch( function()
	// 			{
	// 				Growls.success(
	// 					this.$gettextInterpolate( 'library.playlists.remove_playlist_error_growl', { playlist: _this.playlist.name } ),
	// 					this.$gettextInterpolate( 'library.playlists.remove_playlist_error_growl_title', { playlist: _this.playlist.name } )
	// 				);
	// 			} );
	// 		} );
	// };

	// this.removeFromPlaylist = function( game )
	// {
	// 	var playlist = collectionCtrl.playlist;

	// 	ModalConfirm.show( this.$gettextInterpolate( 'library.playlists.remove_game_confirmation', { game: game.title, playlist: playlist.name } ) )
	// 		.then( function()
	// 		{
	// 			playlist.$removeGame( game.id ).then( function()
	// 			{
	// 				Growls.success(
	// 					this.$gettextInterpolate( 'library.playlists.remove_game_success_growl', { game: game.title, playlist: playlist.name } ),
	// 					this.$gettextInterpolate( 'library.playlists.remove_game_success_growl_title', { game: game.title, playlist: playlist.name } )
	// 				);
	// 				_this._removeGame( game );
	// 			} )
	// 			.catch( function()
	// 			{
	// 				Growls.error(
	// 					this.$gettextInterpolate( 'library.playlists.remove_game_error_growl', { game: game.title, playlist: playlist.name } ),
	// 					this.$gettextInterpolate( 'library.playlists.remove_game_error_growl_title', { game: game.title, playlist: playlist.name } )
	// 				);
	// 			} );
	// 		} );
	// };

	// this.removeFromLibrary = function( game )
	// {
	// 	ModalConfirm.show( this.$gettextInterpolate( 'library.followed.remove_game_confirmation', { game: game.title } ) )
	// 		.then( function()
	// 		{
	// 			game.$unfollow().then( function()
	// 			{
	// 				Growls.success(
	// 					this.$gettextInterpolate( 'library.followed.remove_game_success_growl', { game: game.title } ),
	// 					this.$gettextInterpolate( 'library.followed.remove_game_success_growl_title', { game: game.title } )
	// 				);
	// 				_this._removeGame( game );
	// 			} )
	// 			.catch( function()
	// 			{
	// 				Growls.error(
	// 					this.$gettextInterpolate( 'library.followed.remove_game_error_growl', { game: game.title } ),
	// 					this.$gettextInterpolate( 'library.followed.remove_game_error_growl_title', { game: game.title } )
	// 				);
	// 			} );
	// 		} );
	// };

	// this._removeGame = function( game )
	// {
	// 	_.remove( this.games, { id: game.id } );
	// 	--collectionCtrl.gamesCount;
	// 	--collectionCtrl.totalGamesCount;
	// };
}
