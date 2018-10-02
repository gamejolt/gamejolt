import View from '!view!./collection.html?style=./collection.styl';
import { Component, Prop } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { State } from 'vuex-class';
import { Ads } from '../../../../lib/gj-lib-client/components/ad/ads.service';
import { AppAdPlacement } from '../../../../lib/gj-lib-client/components/ad/placement/placement';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { AppAuthRequired } from '../../../../lib/gj-lib-client/components/auth/auth-required-directive.vue';
import { GameBundle } from '../../../../lib/gj-lib-client/components/game-bundle/game-bundle.model';
import { GamePlaylist } from '../../../../lib/gj-lib-client/components/game-playlist/game-playlist.model';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { Jam } from '../../../../lib/gj-lib-client/components/jam/jam.model';
import { AppLoadingFade } from '../../../../lib/gj-lib-client/components/loading/fade/fade';
import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { AppPopper } from '../../../../lib/gj-lib-client/components/popper/popper';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import {
	ThemeMutation,
	ThemeStore,
} from '../../../../lib/gj-lib-client/components/theme/theme.store';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import { enforceLocation } from '../../../../lib/gj-lib-client/utils/router';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { GameCollection } from '../../../components/game/collection/collection.model';
import { AppGameCollectionFollowWidget } from '../../../components/game/collection/follow-widget/follow-widget';
import { AppGameCollectionThumbnail } from '../../../components/game/collection/thumbnail/thumbnail';
import { GameFilteringContainer } from '../../../components/game/filtering/container';
import { AppGameGrid } from '../../../components/game/grid/grid';
import { AppGameListing } from '../../../components/game/listing/listing';
import { GameListingContainer } from '../../../components/game/listing/listing-container-service';
import { AppPageHeader } from '../../../components/page-header/page-header';
import { store, Store, tillStoreBootstrapped } from '../../../store/index';
import { LibraryAction, LibraryState, LibraryStore } from '../../../store/library';

const MixableTypes = ['followed', 'playlist', 'owned', 'developer'];
const UserTypes = ['followed', 'owned', 'developer', 'recommended'];

@View
@Component({
	name: 'RouteLibraryCollection',
	components: {
		AppPageHeader,
		AppGameCollectionThumbnail,
		AppJolticon,
		AppPopper,
		AppGameListing,
		AppGameGrid,
		AppGameCollectionFollowWidget,
		AppLoadingFade,
		AppAdPlacement,
	},
	directives: {
		AppTooltip,
		AppAuthRequired,
	},
	filters: {
		number,
	},
})
export default class RouteLibraryCollection extends BaseRouteComponent {
	@Prop(String)
	id!: string;

	@State
	app!: Store['app'];
	@LibraryState
	collections!: LibraryStore['collections'];

	@LibraryAction
	removeGameFromPlaylist!: LibraryStore['removeGameFromPlaylist'];
	@LibraryAction
	unfollowGame!: LibraryStore['unfollowGame'];
	@LibraryAction
	editPlaylist!: LibraryStore['editPlaylist'];
	@LibraryAction
	removePlaylist!: LibraryStore['removePlaylist'];

	@ThemeMutation
	setPageTheme!: ThemeStore['setPageTheme'];

	type = '';
	followerCount = 0;

	collection: GameCollection | null = null;
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

	// Not really able to make this lazy since it needs payload to build out the
	// header.
	@RouteResolve({ cache: true })
	async routeResolve(this: undefined, route: Route) {
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

		// We await a user touch in the parent so this should be correct by the
		// time we get here.
		if (store.state.app.user) {
			await tillStoreBootstrapped;
		}

		return payload;
	}

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
			} else if (this.type === GameCollection.TYPE_TAG) {
				return `#${this.tag}`;
			} else if (this.type === GameCollection.TYPE_JAM && this.jam) {
				return 'Jam games entered into ' + this.jam.name;
			}
		}

		return null;
	}

	routed($payload: any) {
		if (!this.listing || !this.filtering) {
			this.filtering = new GameFilteringContainer(this.$route);
			this.listing = new GameListingContainer(this.filtering);
		}

		this.filtering.init(this.$route);
		this.listing.setAdTargeting(this.$route);
		this.listing.processPayload(this.$route, $payload);

		Ads.setAdUnit('gamesdir');

		this.type = this.$route.meta.collectionType;

		// We try pulling a populated collection from the registry.
		// This will be the case if it's in their library.
		// When they don't have it registered in their library, we just make an instance of a new one.
		this.collection =
			this.collections.find(
				item => item.type === this.type && (item as any).id === this.processedId
			) || null;

		if (!this.collection) {
			this.collection = new GameCollection($payload.collection);
			this.playlist = $payload.playlist ? new GamePlaylist($payload.playlist) : null;
		} else {
			this.playlist = this.collection.playlist || null;
		}

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

		if (this.user) {
			this.setPageTheme(this.user.theme || null);
		} else {
			this.setPageTheme(null);
		}

		this.processMeta($payload);
		this.mixPlaylist();
	}

	routeDestroy() {
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

	get processedId() {
		// Get the collection id.
		let id = this.id;
		if (GameCollection.USER_TYPES.indexOf(this.type) !== -1) {
			id = '@' + id;
		}

		return id;
	}

	get tag() {
		if (this.type !== 'tag') {
			return undefined;
		}

		return this.id;
	}

	get shouldShowFollowers() {
		return (
			this.type !== GameCollection.TYPE_BUNDLE &&
			this.type !== GameCollection.TYPE_TAG &&
			this.type !== GameCollection.TYPE_OWNED
		);
	}

	get shouldShowFollow() {
		return !(
			this.collection &&
			(this.collection.isOwner || this.collection.type === GameCollection.TYPE_OWNED)
		);
	}

	async removeFromPlaylist(game: Game) {
		const playlist = this.collection!.playlist!;
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
