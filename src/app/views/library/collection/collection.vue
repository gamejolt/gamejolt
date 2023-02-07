<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { enforceLocation } from '../../../../utils/router';
import { shallowSetup } from '../../../../utils/vue';
import { Api } from '../../../../_common/api/api.service';
import { vAppAuthRequired } from '../../../../_common/auth/auth-required-directive';
import { formatNumber } from '../../../../_common/filters/number';
import { GameBundle } from '../../../../_common/game-bundle/game-bundle.model';
import { GamePlaylist } from '../../../../_common/game-playlist/game-playlist.model';
import { Game } from '../../../../_common/game/game.model';
import { Jam } from '../../../../_common/jam/jam.model';
import AppLoadingFade from '../../../../_common/loading/AppLoadingFade.vue';
import { Meta } from '../../../../_common/meta/meta-service';
import AppPopper from '../../../../_common/popper/AppPopper.vue';
import { BaseRouteComponent, OptionsForRoute } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import { useCommonStore } from '../../../../_common/store/common-store';
import { useThemeStore } from '../../../../_common/theme/theme.store';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { User } from '../../../../_common/user/user.model';
import { GameCollection } from '../../../components/game/collection/collection.model';
import AppGameCollectionFollowWidget from '../../../components/game/collection/follow-widget/follow-widget.vue';
import AppGameCollectionThumbnail from '../../../components/game/collection/thumbnail/thumbnail.vue';
import { GameFilteringContainer } from '../../../components/game/filtering/container';
import AppGameGrid from '../../../components/game/grid/grid.vue';
import AppGameListing from '../../../components/game/listing/AppGameListing.vue';
import { GameListingContainer } from '../../../components/game/listing/listing-container-service';
import AppPageHeader from '../../../components/page-header/AppPageHeader.vue';
import AppPageHeaderControls from '../../../components/page-header/controls/controls.vue';
import { useAppStore } from '../../../store/index';
import {
	libraryEditPlaylist,
	libraryRemoveGameFromPlaylist,
	libraryRemovePlaylist,
	libraryUnfollowGame,
	useLibraryStore,
} from '../../../store/library';

const CollectionThemeKey = 'collection';

const MixableTypes = ['followed', 'playlist', 'owned', 'developer'];
const UserTypes = ['followed', 'owned', 'developer', 'recommended'];

@Options({
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
		AppTooltip: vAppTooltip,
		AppAuthRequired: vAppAuthRequired,
	},
})
@OptionsForRoute({
	// Not really able to make this lazy since it needs payload to build out the
	// header.
	cache: true,
	async resolver({ route }) {
		const type = route.meta.collectionType as string;
		const filtering = new GameFilteringContainer(route);
		const query = filtering.getQueryString(route);

		let id: string = route.params.id as string;
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
	store = setup(() => useAppStore());
	commonStore = setup(() => useCommonStore());
	themeStore = setup(() => useThemeStore());
	libraryStore = shallowSetup(() => useLibraryStore());

	get app() {
		return this.commonStore;
	}

	get collections() {
		return this.libraryStore.collections.value;
	}

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
	readonly formatNumber = formatNumber;
	readonly libraryEditPlaylist = libraryEditPlaylist;
	readonly libraryRemovePlaylist = libraryRemovePlaylist;

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
		// time we get here. We need to wait till they have their library loaded
		// in.
		if (this.app.user) {
			await this.store.tillStoreBootstrapped;
		}

		if (!this.listing || !this.filtering) {
			this.filtering = new GameFilteringContainer(this.$route);
			this.listing = new GameListingContainer({ loadInfinitely: false });
		}

		this.filtering.init(this.$route);
		this.listing.processPayload(this.$route, $payload);

		this.type = this.$route.meta.collectionType as string;

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
		const theme = this.user?.theme ?? null;
		this.themeStore.setPageTheme({ key: CollectionThemeKey, theme });

		this.processMeta($payload);
		this.mixPlaylist();
	}

	routeDestroyed() {
		this.themeStore.clearPageTheme(CollectionThemeKey);
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

	get shouldShowEditPlaylist() {
		return (
			!this.shouldShowFollow && this.collection.type === 'playlist' && this.collection.isOwner
		);
	}

	async removeFromPlaylist(game: Game) {
		const playlist = this.collection.playlist!;
		if (
			await libraryRemoveGameFromPlaylist(this.libraryStore, playlist, game, {
				shouldConfirm: true,
			})
		) {
			this.reloadRoute();
		}
	}

	async removeFromLibrary(game: Game) {
		if (await libraryUnfollowGame(this.libraryStore, game)) {
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
</script>

<template>
	<div v-if="collection">
		<AppPageHeader
			class="library-collection-header"
			:hide-nav="type === 'bundle'"
			:autoscroll-anchor-key="collection._id"
		>
			<div class="row collection-copy">
				<div v-if="!Screen.isXs" class="col-sm-4 col-md-3">
					<AppGameCollectionThumbnail
						:key="collection._id"
						class="anim-fade-in-enlarge"
						:collection="collection"
					/>
				</div>
				<div class="col-sm-8 col-md-9">
					<transition mode="out-in" appear>
						<div :key="collection._id" class="anim-fade-enter-right anim-fade-leave-up">
							<!--
								Followed Games
							-->
							<template v-if="type === 'followed'">
								<template v-if="collection.isOwner">
									<h1>
										<AppTranslate>Your Followed Games</AppTranslate>
									</h1>
									<p class="text-muted small">
										<AppTranslate>
											When you follow a game, it shows up here.
										</AppTranslate>
										<br />
										<AppTranslate>
											You'll receive notifications when developers post news
											about any games you're following.
										</AppTranslate>
									</p>
								</template>
								<template v-else-if="user">
									<h1>
										<AppTranslate>Games Followed</AppTranslate>
									</h1>
									<h4>
										<AppTranslate>by</AppTranslate>
										{{ ' ' }}
										<router-link
											class="link-unstyled"
											:to="{
												name: 'profile.overview',
												params: { username: user.username },
											}"
										>
											{{ user.display_name }}
										</router-link>
										{{ ' ' }}
										<small>@{{ user.username }}</small>
									</h4>
									<p class="text-muted small">
										<AppTranslate
											:translate-params="{ user: user.display_name }"
										>
											These are the games that %{ user } is following.
										</AppTranslate>
									</p>
								</template>
							</template>

							<!--
								Developer Games
							-->
							<template v-else-if="type === 'developer'">
								<template v-if="collection.isOwner">
									<h1>
										<AppTranslate>Your Games</AppTranslate>
									</h1>
									<p class="text-muted small">
										<AppTranslate>
											These are the games that you've made or collaborated on.
											Be proud!
										</AppTranslate>
										<br />
										<AppTranslate>
											Feel free to share this page with others to show off
											your games.
										</AppTranslate>
									</p>
									<br />
									<div>
										<AppButton :to="{ name: 'dash.games.add' }">
											<AppTranslate>Add Your Game</AppTranslate>
										</AppButton>
									</div>
								</template>
								<template v-else-if="user">
									<h1>
										<AppTranslate>Games</AppTranslate>
									</h1>
									<h4>
										<AppTranslate>by</AppTranslate>
										{{ ' ' }}
										<router-link
											class="link-unstyled"
											:to="{
												name: 'profile.overview',
												params: { username: user.username },
											}"
										>
											{{ user.display_name }}
										</router-link>
										{{ ' ' }}
										<small>@{{ user.username }}</small>
									</h4>
									<p class="text-muted small">
										<AppTranslate
											:translate-params="{ user: user.display_name }"
										>
											These are the games made by %{ user }.
										</AppTranslate>
									</p>
								</template>
							</template>

							<!--
								Owned Games
							-->
							<template v-else-if="type === 'owned'">
								<template v-if="collection.isOwner">
									<h1>
										<AppTranslate>Your Owned Games</AppTranslate>
									</h1>
									<p class="text-muted small">
										<AppTranslate>
											These are all the games you own.
										</AppTranslate>
									</p>
								</template>
								<template v-else-if="user">
									<h1>
										<AppTranslate>Games Owned</AppTranslate>
									</h1>
									<h4>
										<AppTranslate>by</AppTranslate>
										{{ ' ' }}
										<router-link
											class="link-unstyled"
											:to="{
												name: 'profile.overview',
												params: { username: user.username },
											}"
										>
											{{ user.display_name }}
										</router-link>
										{{ ' ' }}
										<small>@{{ user.username }}</small>
									</h4>
									<p class="text-muted small">
										<AppTranslate
											:translate-params="{ user: user.display_name }"
										>
											These are all the games owned by %{ user }.
										</AppTranslate>
									</p>
								</template>
							</template>

							<!--
								Recommended Games
							-->
							<template v-else-if="type === 'recommended'">
								<template v-if="collection.isOwner">
									<h1>
										<AppTranslate>Your Daily Mix</AppTranslate>
									</h1>
									<p class="text-muted small">
										<AppTranslate>
											Every day we pick a handful of games that we think you
											may like!
										</AppTranslate>
									</p>
								</template>
								<template v-else-if="user">
									<h1>
										<AppTranslate>Daily Mix</AppTranslate>
									</h1>
									<h4>
										<AppTranslate>for</AppTranslate>
										{{ ' ' }}
										<router-link
											class="link-unstyled"
											:to="{
												name: 'profile.overview',
												params: { username: user.username },
											}"
										>
											{{ user.display_name }}
										</router-link>
										{{ ' ' }}
										<small>@{{ user.username }}</small>
									</h4>
								</template>
							</template>

							<!--
								Playlist
							-->
							<template v-else-if="type === 'playlist' && playlist">
								<h1>
									{{ playlist.name }}
								</h1>

								<h4 v-if="!collection.isOwner">
									<AppTranslate>by</AppTranslate>
									{{ ' ' }}
									<router-link
										class="link-unstyled"
										:to="{
											name: 'profile.overview',
											params: { username: playlist.user.username },
										}"
									>
										{{ playlist.user.display_name }}
									</router-link>
									{{ ' ' }}
									<small>@{{ playlist.user.username }}</small>
								</h4>
							</template>

							<!--
								Bundle
							-->
							<template v-else-if="type === 'bundle' && bundle">
								<h1>{{ bundle.title }}</h1>
								<p class="text-muted small">{{ bundle.description }}</p>
							</template>

							<!--
								Jam
							-->
							<template v-else-if="type === 'jam' && jam">
								<h1>{{ jam.name }}</h1>
								<p class="text-muted small">
									<AppTranslate :translate-params="{ jam: jam.name }">
										These are the jam games entered into %{ jam }.
									</AppTranslate>
								</p>
								<p>
									<AppButton :href="jam.fullUrl" target="_blank">
										<AppTranslate>View Jam Page</AppTranslate>
									</AppButton>
								</p>
							</template>
						</div>
					</transition>
				</div>
			</div>

			<template v-if="listing" #nav>
				<ul class="stat-list">
					<li v-if="shouldShowFollowers" class="stat-big stat-big-smaller">
						<div class="stat-big-label">
							<AppTranslate>Followers</AppTranslate>
						</div>
						<div class="stat-big-digit">{{ formatNumber(followerCount) }}</div>
					</li>
					<li class="stat-big stat-big-smaller">
						<div class="stat-big-label">
							<AppTranslate>Games</AppTranslate>
						</div>
						<div class="stat-big-digit">
							{{ formatNumber(listing?.gamesCount || 0) }}
						</div>
					</li>
				</ul>
			</template>

			<template #controls>
				<AppPageHeaderControls>
					<!-- Following -->
					<AppGameCollectionFollowWidget
						v-if="shouldShowFollow"
						block
						:collection="collection"
						:follower-count="followerCount"
						@follow="++followerCount"
						@unfollow="--followerCount"
					/>

					<template v-if="shouldShowEditPlaylist">
						<!-- Editing Playlist -->
						<AppButton block @click="libraryEditPlaylist(libraryStore, collection)">
							<AppTranslate>Edit Playlist</AppTranslate>
						</AppButton>
					</template>

					<!-- More options -->
					<template v-if="shouldShowEditPlaylist" #end>
						<AppPopper popover-class="fill-darkest">
							<AppButton icon="ellipsis-v" circle trans />

							<template #popover>
								<div class="list-group list-group-dark">
									<a
										class="list-group-item has-icon"
										@click="libraryRemovePlaylist(libraryStore, collection)"
									>
										<AppJolticon icon="remove" notice />
										<AppTranslate> Remove Playlist </AppTranslate>
									</a>
								</div>
							</template>
						</AppPopper>
					</template>
				</AppPageHeaderControls>
			</template>
		</AppPageHeader>

		<AppGameListing
			:listing="listing"
			:filtering="filtering"
			hide-section-nav
			:is-loading="isRouteLoading"
		>
			<AppGameGrid v-if="listing" :games="listing.games" event-label="collection-games">
				<template
					v-if="type === 'playlist' || type === 'followed'"
					#thumbnail-controls="props"
				>
					<AppButton
						v-if="type === 'playlist' && collection.isOwner"
						v-app-tooltip="$gettext(`Remove from playlist`)"
						icon="remove"
						circle
						overlay
						@click="removeFromPlaylist(props.game)"
					/>

					<AppButton
						v-if="type === 'followed' && collection.isOwner"
						v-app-tooltip="$gettext(`Stop following`)"
						icon="remove"
						circle
						overlay
						@click="removeFromLibrary(props.game)"
					/>
				</template>
			</AppGameGrid>
		</AppGameListing>

		<section v-if="recommendedGames.length" class="section">
			<div class="container-xl">
				<div class="clearfix">
					<h1 class="section-header">
						<AppTranslate>Recommended Games</AppTranslate>
					</h1>
					<div :class="{ 'pull-left': !Screen.isXs }">
						<p>
							<AppTranslate>
								We remixed this playlist into a tasty collection of other games that
								you may enjoy.
							</AppTranslate>
						</p>
						<hr class="underbar" />
					</div>
					<div class="hidden-xs pull-right">
						<AppButton @click="mixPlaylist(true)">
							<AppTranslate>Refresh</AppTranslate>
						</AppButton>
					</div>
				</div>

				<AppLoadingFade :is-loading="isLoadingRecommended">
					<AppGameGrid
						:games="recommendedGames"
						scrollable
						event-label="collection-games-mix"
					/>
				</AppLoadingFade>

				<p class="visible-xs">
					<AppButton block @click="mixPlaylist(true)">
						<AppTranslate>Refresh</AppTranslate>
					</AppButton>
				</p>
			</div>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
.library-collection-header
	.collection-copy
		margin-bottom: $font-size-base

	h4
		theme-prop('color', 'fg-muted')
		margin-top: 0

	p
		margin-top: $font-size-base
		margin-bottom: 0

	@media $media-xs
		text-align: center
</style>
