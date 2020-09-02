import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { enforceLocation } from '../../../../utils/router';
import { Api } from '../../../../_common/api/api.service';
import { AppAuthRequired } from '../../../../_common/auth/auth-required-directive';
import { number } from '../../../../_common/filters/number';
import { GameBundle } from '../../../../_common/game-bundle/game-bundle.model';
import { GamePlaylist } from '../../../../_common/game-playlist/game-playlist.model';
import { Game } from '../../../../_common/game/game.model';
import { Jam } from '../../../../_common/jam/jam.model';
import AppLoadingFade from '../../../../_common/loading/fade/fade.vue';
import { Meta } from '../../../../_common/meta/meta-service';
import AppPopper from '../../../../_common/popper/popper.vue';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import { ThemeMutation, ThemeStore } from '../../../../_common/theme/theme.store';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { User } from '../../../../_common/user/user.model';
import { GameCollection } from '../../../components/game/collection/collection.model';
import AppGameCollectionFollowWidget from '../../../components/game/collection/follow-widget/follow-widget.vue';
import AppGameCollectionThumbnail from '../../../components/game/collection/thumbnail/thumbnail.vue';
import { GameFilteringContainer } from '../../../components/game/filtering/container';
import AppGameGrid from '../../../components/game/grid/grid.vue';
import { GameListingContainer } from '../../../components/game/listing/listing-container-service';
import AppGameListing from '../../../components/game/listing/listing.vue';
import AppPageHeaderControls from '../../../components/page-header/controls/controls.vue';
import AppPageHeader from '../../../components/page-header/page-header.vue';
import { Store, tillStoreBootstrapped } from '../../../store/index';
import { LibraryModule, LibraryStore } from '../../../store/library';

const MixableTypes = ['followed', 'playlist', 'owned', 'developer'];
const UserTypes = ['followed', 'owned', 'developer', 'recommended'];

@Component({
	name: 'RouteLibraryCollection',
	components: {
		AppPageHeader,
		AppPageHeaderControls,
		AppGameCollectionThumbnail,
		AppPopper,
		AppGameListing,
		AppGameGrid,
		AppGameCollectionFollowWidget,
		AppLoadingFade,
	},
	directives: {
		AppTooltip,
		AppAuthRequired,
	},
	filters: {
		number,
	},
})
@RouteResolver({
	// Not really able to make this lazy since it needs payload to build out the
	// header.
	cache: true,
	async resolver({ route }) {
		const type = route.meta.collectionType;
		const filtering = new GameFilteringContainer(route);
		const query = filtering.getQueryString(route);

		let id: string = route.params.id;
		if (GameCollection.USER_TYPES.indexOf(type) !== -1) {
			id = '@' + id;
		}

		const payload = await Api.sendRequest(
			`/web/library/games/${route.meta.collectionType}/${id}?${query}`
		);

		// These are the only types with a slug in the URL. The rest have to be
		// exact param matches and can never change.
		if (type === 'bundle' || type === 'playlist') {
			if (payload && payload.collection) {
				const redirect = enforceLocation(route, { slug: payload.collection.slug });
				if (redirect) {
					return redirect;
				}
			}
		}

		return payload;
	},
})
export default class RouteLibraryCollection extends BaseRouteComponent {
	@State
	app!: Store['app'];

	@ThemeMutation
	setPageTheme!: ThemeStore['setPageTheme'];

	@LibraryModule.State
	collections!: LibraryStore['collections'];

	@LibraryModule.Action
	removeGameFromPlaylist!: LibraryStore['removeGameFromPlaylist'];

	@LibraryModule.Action
	unfollowGame!: LibraryStore['unfollowGame'];

	@LibraryModule.Action
	editPlaylist!: LibraryStore['editPlaylist'];

	@LibraryModule.Action
	removePlaylist!: LibraryStore['removePlaylist'];

	type = '';
	followerCount = 0;

	collection: GameCollection = null as any;
	bundle: GameBundle | null = null;
	playlist: GamePlaylist | null = null;
	jam: Jam | null = null;
	user: User | null = null;

	filtering: GameFilteringContainer | null = null;
	listing: GameListingContainer | null = null;

	recommendedGames: Game[] = [];
	isLoadingRecommended = false;

	metaTitle = '';

	readonly Screen = Screen;

	get routeTitle() {
		if (this.metaTitle) {
			return this.metaTitle;
		} else if (this.type) {
			if (this.type === GameCollection.TYPE_FOLLOWED && this.user && this.collection) {
				const params = { user: '@' + this.user.username };
				if (this.collection.isOwner) {
					return this.$gettext('Your Followed Games');
				} else {
					return this.$gettextInterpolate('Games Followed by %{ user }', params);
				}
			} else if (
				this.type === GameCollection.TYPE_PLAYLIST &&
				this.playlist &&
				this.user &&
				this.collection
			) {
				const params = {
					playlist: this.playlist.name,
					user: '@' + this.user.username,
				};
				if (this.collection.isOwner) {
					return this.playlist.name;
				} else {
					return this.$gettextInterpolate('%{ playlist } by %{ user }', params);
				}
			} else if (
				this.type === GameCollection.TYPE_DEVELOPER &&
				this.user &&
				this.collection
			) {
				const params = { user: '@' + this.user.username };
				if (this.collection.isOwner) {
					return this.$gettext('Your Games');
				} else {
					return this.$gettextInterpolate('Games by %{ user }', params);
				}
			} else if (this.type === GameCollection.TYPE_OWNED && this.user && this.collection) {
				const params = { user: '@' + this.user.username };
				if (this.collection.isOwner) {
					return this.$gettext('Your Owned Games');
				} else {
					return this.$gettextInterpolate('Games Owned by %{ user }', params);
				}
			} else if (
				this.type === GameCollection.TYPE_RECOMMENDED &&
				this.collection &&
				this.user
			) {
				const params = { user: '@' + this.user.username };
				if (this.collection.isOwner) {
					return this.$gettext('Your Daily Mix');
				} else {
					return this.$gettextInterpolate('Daily Mix for %{ user }', params);
				}
			} else if (this.type === GameCollection.TYPE_BUNDLE && this.bundle) {
				return this.bundle.title;
			} else if (this.type === GameCollection.TYPE_JAM && this.jam) {
				return 'Jam games entered into ' + this.jam.name;
			}
		}

		return null;
	}

	async routeResolved($payload: any) {
		// We await a user touch in the parent so this should be correct by the
		// time we get here. We need to wait till they have their library loaded in.
		if (this.app.user) {
			await tillStoreBootstrapped;
		}

		if (!this.listing || !this.filtering) {
			this.filtering = new GameFilteringContainer(this.$route);
			this.listing = new GameListingContainer(this.filtering);
		}

		this.filtering.init(this.$route);
		this.listing.processPayload(this.$route, $payload);

		this.type = this.$route.meta.collectionType;

		// We try pulling a populated collection from the registry. This will be
		// the case if it's in their library. When they don't have it registered
		// in their library, we just make an instance of a new one.
		let collection =
			this.collections.find(
				item => item.type === this.type && (item as any).id === this.processedId
			) || null;

		if (!collection) {
			collection = new GameCollection($payload.collection);
			this.playlist = $payload.playlist ? new GamePlaylist($payload.playlist) : null;
		} else {
			this.playlist = collection.playlist || null;
		}
		this.collection = collection;

		this.followerCount = $payload.followerCount || 0;
		this.bundle = $payload.bundle ? new GameBundle($payload.bundle) : null;
		this.jam = $payload.jam ? new Jam($payload.jam) : null;

		this.user = null;
		if (this.type === 'followed' || this.type === 'owned' || this.type === 'recommended') {
			this.user = new User($payload.user);
		} else if (this.type === 'developer') {
			this.user = new User($payload.developer);
		} else if (this.playlist) {
			this.user = this.playlist.user;
		}

		// This should be in a resolveStore func, but I don't want to refactor
		// the whole route to use a store so that we can access user. It won't
		// lose much if SSR doesn't see that the page theme isn't set.
		if (this.user) {
			this.setPageTheme(this.user.theme || null);
		} else {
			this.setPageTheme(null);
		}

		this.processMeta($payload);
		this.mixPlaylist();
	}

	routeDestroyed() {
		this.setPageTheme(null);
	}

	private processMeta($payload: any) {
		if ($payload.metaTitle) {
			this.metaTitle = $payload.metaTitle;
		}

		if ($payload.metaDescription) {
			Meta.description = $payload.metaDescription;
		}

		if ($payload.fb) {
			Meta.fb = $payload.fb;
			Meta.fb.title = this.routeTitle;
		}

		if ($payload.twitter) {
			Meta.twitter = $payload.twitter;
			Meta.twitter.title = this.routeTitle;
		}
	}

	get id() {
		return this.$route.params.id;
	}

	get processedId() {
		// Get the collection id.
		let id = this.id;
		if (GameCollection.USER_TYPES.indexOf(this.type) !== -1) {
			id = '@' + id;
		}

		return id;
	}

	get shouldShowFollowers() {
		return this.type !== GameCollection.TYPE_BUNDLE && this.type !== GameCollection.TYPE_OWNED;
	}

	get shouldShowFollow() {
		if (!this.collection) {
			return false;
		}

		// Don't show follow for owned collections
		if (this.collection.isOwner || this.collection.type === GameCollection.TYPE_OWNED) {
			return false;
		}

		// Special case for developer collections: They prompt to follow the user instead of a playlist,
		// so we need to make sure we hide the button if the user is blocked.
		if (
			this.collection.type === 'developer' &&
			this.collection.owner &&
			this.app.user &&
			this.collection.owner.id !== this.app.user.id
		) {
			return !this.collection.owner.is_blocked && !this.collection.owner.blocked_you;
		}

		return true;
	}

	async removeFromPlaylist(game: Game) {
		const playlist = this.collection.playlist!;
		if (await this.removeGameFromPlaylist({ playlist, game, shouldConfirm: true })) {
			this.reloadRoute();
		}
	}

	async removeFromLibrary(game: Game) {
		if (await this.unfollowGame(game)) {
			this.reloadRoute();
		}
	}

	async mixPlaylist(shouldRefresh = false) {
		if (MixableTypes.indexOf(this.type) === -1) {
			this.recommendedGames = [];
			return;
		}

		let id = this.id;
		if (UserTypes.indexOf(this.type) !== -1) {
			id = '@' + id;
		}

		const action = shouldRefresh ? 'refresh-mix' : 'mix';

		this.isLoadingRecommended = true;
		const payload = await Api.sendRequest(
			`/web/library/games/${action}/` + this.type + '/' + id
		);
		this.recommendedGames = Game.populate(payload.games);
		this.isLoadingRecommended = false;
	}
}
