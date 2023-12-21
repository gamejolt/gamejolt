<script lang="ts">
import { computed, ref, toRef } from 'vue';
import { useRoute } from 'vue-router';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import { formatNumber } from '../../../../_common/filters/number';
import { GameBundleModel } from '../../../../_common/game-bundle/game-bundle.model';
import { GamePlaylistModel } from '../../../../_common/game-playlist/game-playlist.model';
import { GameModel } from '../../../../_common/game/game.model';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppLoadingFade from '../../../../_common/loading/AppLoadingFade.vue';
import { Meta } from '../../../../_common/meta/meta-service';
import AppPopper from '../../../../_common/popper/AppPopper.vue';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import { useCommonStore } from '../../../../_common/store/common-store';
import { useThemeStore } from '../../../../_common/theme/theme.store';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../_common/translate/translate.service';
import { UserModel } from '../../../../_common/user/user.model';
import { enforceLocation } from '../../../../utils/router';
import {
	GameCollectionModel,
	GameCollectionType,
	GameCollectionUserTypes,
} from '../../../components/game/collection/collection.model';
import AppGameCollectionFollowWidget from '../../../components/game/collection/follow-widget/follow-widget.vue';
import AppGameCollectionThumbnail from '../../../components/game/collection/thumbnail/AppGameCollectionThumbnail.vue';
import { GameFilteringContainer } from '../../../components/game/filtering/container';
import AppGameGrid from '../../../components/game/grid/AppGameGrid.vue';
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

export default {
	...defineAppRouteOptions({
		// Since this component is used for multiple routes, we need to always
		// have to re-resolve since the params won't change, but the route name
		// itself will.
		deps: null,
		// Not really able to make this lazy since it needs payload to build out the
		// header.
		cache: true,
		async resolver({ route }) {
			const type = route.meta.collectionType as GameCollectionType;
			const filtering = new GameFilteringContainer(route);
			const query = filtering.getQueryString(route);

			let id: string = route.params.id as string;
			if (GameCollectionUserTypes.indexOf(type) !== -1) {
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
	}),
};
</script>

<script lang="ts" setup>
const route = useRoute();

const { tillStoreBootstrapped } = useAppStore();
const { user: sessionUser } = useCommonStore();
const { setPageTheme, clearPageTheme } = useThemeStore();
const libraryStore = useLibraryStore();
const { collections } = libraryStore;

const type = ref<GameCollectionType | null>(null);
const followerCount = ref(0);

const collection = ref<GameCollectionModel>(null as any);
const bundle = ref<GameBundleModel | null>(null);
const playlist = ref<GamePlaylistModel | null>(null);
const user = ref<UserModel | null>(null);

const filtering = ref<GameFilteringContainer | null>(null);
const listing = ref<GameListingContainer | null>(null);

const recommendedGames = ref<GameModel[]>([]);
const isLoadingRecommended = ref(false);

const metaTitle = ref('');

const routeTitle = computed(() => {
	if (metaTitle.value) {
		return metaTitle.value;
	} else if (type.value) {
		if (type.value === GameCollectionType.Followed && user.value && collection.value) {
			const params = { user: '@' + user.value.username };
			if (collection.value.isOwner) {
				return $gettext('Your Followed Games');
			} else {
				return $gettext('Games Followed by %{ user }', params);
			}
		} else if (
			type.value === GameCollectionType.Playlist &&
			playlist.value &&
			user.value &&
			collection.value
		) {
			const params = {
				playlist: playlist.value.name,
				user: '@' + user.value.username,
			};
			if (collection.value.isOwner) {
				return playlist.value.name;
			} else {
				return $gettext('%{ playlist } by %{ user }', params);
			}
		} else if (type.value === GameCollectionType.Developer && user.value && collection.value) {
			const params = { user: '@' + user.value.username };
			if (collection.value.isOwner) {
				return $gettext('Your Games');
			} else {
				return $gettext('Games by %{ user }', params);
			}
		} else if (type.value === GameCollectionType.Owned && user.value && collection.value) {
			const params = { user: '@' + user.value.username };
			if (collection.value.isOwner) {
				return $gettext('Your Owned Games');
			} else {
				return $gettext('Games Owned by %{ user }', params);
			}
		} else if (
			type.value === GameCollectionType.Recommended &&
			collection.value &&
			user.value
		) {
			const params = { user: '@' + user.value.username };
			if (collection.value.isOwner) {
				return $gettext('Your Daily Mix');
			} else {
				return $gettext('Daily Mix for %{ user }', params);
			}
		} else if (type.value === GameCollectionType.Bundle && bundle.value) {
			return bundle.value.title;
		}
	}

	return null;
});

const { reload: reloadRoute, isLoading } = createAppRoute({
	routeTitle,
	async onResolved({ payload }) {
		// We await a user touch in the parent so this should be correct by the
		// time we get here. We need to wait till they have their library loaded
		// in.
		if (sessionUser.value) {
			await tillStoreBootstrapped.value;
		}

		type.value = route.meta.collectionType as GameCollectionType;

		if (!listing.value || !filtering.value) {
			filtering.value = new GameFilteringContainer(route);
			listing.value = new GameListingContainer({
				loadInfinitely: type.value === GameCollectionType.Developer,
			});
		}

		filtering.value.init(route);
		listing.value.processPayload(route, payload);

		// We try pulling a populated collection from the registry. This will be
		// the case if it's in their library. When they don't have it registered
		// in their library, we just make an instance of a new one.
		let newCollection =
			collections.value.find(
				item => item.type === type.value && (item as any).id === processedId.value
			) || null;

		if (!newCollection) {
			newCollection = new GameCollectionModel(payload.collection);
			playlist.value = payload.playlist ? new GamePlaylistModel(payload.playlist) : null;
		} else {
			playlist.value = newCollection.playlist || null;
		}
		collection.value = newCollection;

		followerCount.value = payload.followerCount || 0;
		bundle.value = payload.bundle ? new GameBundleModel(payload.bundle) : null;

		user.value = null;
		if (
			type.value === GameCollectionType.Followed ||
			type.value === GameCollectionType.Owned ||
			type.value === GameCollectionType.Recommended
		) {
			user.value = new UserModel(payload.user);
		} else if (type.value === GameCollectionType.Developer) {
			user.value = new UserModel(payload.developer);
		} else if (playlist.value) {
			user.value = playlist.value.user;
		}

		// This should be in a resolveStore func, but I don't want to refactor
		// the whole route to use a store so that we can access user. It won't
		// lose much if SSR doesn't see that the page theme isn't set.
		const theme = user.value?.theme ?? null;
		setPageTheme({ key: CollectionThemeKey, theme });

		_processMeta(payload);
		mixPlaylist();
	},
	onDestroyed() {
		clearPageTheme(CollectionThemeKey);
	},
});

function _processMeta(payload: any) {
	if (payload.metaTitle) {
		metaTitle.value = payload.metaTitle;
	}

	if (payload.metaDescription) {
		Meta.description = payload.metaDescription;
	}

	if (payload.fb) {
		Meta.fb = payload.fb;
		Meta.fb.title = routeTitle.value;
	}

	if (payload.twitter) {
		Meta.twitter = payload.twitter;
		Meta.twitter.title = routeTitle.value;
	}
}

const id = toRef(() => route.params.id);

const processedId = computed(() => {
	// Get the collection id.
	let result = id.value;
	if (type.value && GameCollectionUserTypes.indexOf(type.value) !== -1) {
		result = '@' + result;
	}

	return result;
});

const shouldShowFollowers = toRef(() => {
	return type.value !== GameCollectionType.Bundle && type.value !== GameCollectionType.Owned;
});

const shouldShowFollow = computed(() => {
	if (!collection.value) {
		return false;
	}

	// Don't show follow for owned collections
	if (collection.value.isOwner || collection.value.type === GameCollectionType.Owned) {
		return false;
	}

	// Special case for developer collections: They prompt to follow the user instead of a playlist,
	// so we need to make sure we hide the button if the user is blocked.
	if (
		collection.value.type === 'developer' &&
		collection.value.owner &&
		sessionUser.value &&
		collection.value.owner.id !== sessionUser.value.id
	) {
		return !collection.value.owner.is_blocked && !collection.value.owner.blocked_you;
	}

	return true;
});

const shouldShowEditPlaylist = computed(() => {
	return (
		!shouldShowFollow.value &&
		collection.value.type === GameCollectionType.Playlist &&
		collection.value.isOwner
	);
});

const canReorder = computed(() => {
	return (
		collection.value.type === GameCollectionType.Developer &&
		collection.value.isOwner &&
		(filtering.value === null || filtering.value.areTagFiltersEmpty)
	);
});

async function onSortedGames(games: GameModel[]) {
	if (!canReorder.value || !listing.value) {
		return;
	}

	listing.value.setGames(games);

	await Api.sendRequest(
		`/web/dash/developer/games/save-sort`,
		{
			game_ids: games.map(x => x.id),
		},
		{
			noErrorRedirect: true,
			allowComplexData: ['game_ids'],
		}
	);
}

async function removeFromPlaylist(game: GameModel) {
	const playlist = collection.value.playlist!;
	if (
		await libraryRemoveGameFromPlaylist(libraryStore, playlist, game, {
			shouldConfirm: true,
		})
	) {
		reloadRoute();
	}
}

async function removeFromLibrary(game: GameModel) {
	if (await libraryUnfollowGame(libraryStore, game)) {
		reloadRoute();
	}
}

async function mixPlaylist(shouldRefresh = false) {
	if (!type.value || MixableTypes.indexOf(type.value) === -1) {
		recommendedGames.value = [];
		return;
	}

	const id = processedId.value;
	const action = shouldRefresh ? 'refresh-mix' : 'mix';

	isLoadingRecommended.value = true;
	const payload = await Api.sendRequest(`/web/library/games/${action}/` + type.value + '/' + id);
	recommendedGames.value = GameModel.populate(payload.games);
	isLoadingRecommended.value = false;
}

async function loadMore() {
	if (!filtering.value || !listing.value || listing.value.isLoadingMore || !type.value) {
		return;
	}

	listing.value.isLoadingMore = true;

	const page = listing.value.currentPage + 1;
	const id = processedId.value;
	const payload = await Api.sendRequest(
		`/web/library/games/${type.value}/${id}?` + filtering.value.getQueryString(route, { page })
	);
	listing.value.processPagePayload(page, payload);
	listing.value.isLoadingMore = false;
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
										{{ $gettext(`Your Followed Games`) }}
									</h1>
									<p class="text-muted small">
										{{ $gettext(`When you follow a game, it shows up here.`) }}

										<br />
										{{
											$gettext(
												`You'll receive notifications when developers post news about any games you're following.`
											)
										}}
									</p>
								</template>
								<template v-else-if="user">
									<h1>
										{{ $gettext(`Games Followed`) }}
									</h1>
									<h4>
										{{ $gettext(`by`) }}
										{{ ' ' }}
										<RouterLink
											class="link-unstyled"
											:to="{
												name: 'profile.overview',
												params: { username: user.username },
											}"
										>
											{{ user.display_name }}
										</RouterLink>
										{{ ' ' }}
										<small>@{{ user.username }}</small>
									</h4>
									<p class="text-muted small">
										{{
											$gettext(
												`These are the games that %{ user } is following.`,
												{ user: user.display_name }
											)
										}}
									</p>
								</template>
							</template>

							<!--
								Developer Games
							-->
							<template v-else-if="type === 'developer'">
								<template v-if="collection.isOwner">
									<h1>
										{{ $gettext(`Your Games`) }}
									</h1>
									<p class="text-muted small">
										{{
											$gettext(
												`These are the games that you've made or collaborated on. Be proud!`
											)
										}}
										<br />
										{{
											$gettext(
												`Feel free to share this page with others to show off your games.`
											)
										}}
									</p>
									<br />
									<div>
										<AppButton :to="{ name: 'dash.games.add' }">
											{{ $gettext(`Add Your Game`) }}
										</AppButton>
									</div>
								</template>
								<template v-else-if="user">
									<h1>
										{{ $gettext(`Games`) }}
									</h1>
									<h4>
										{{ $gettext(`by`) }}
										{{ ' ' }}
										<RouterLink
											class="link-unstyled"
											:to="{
												name: 'profile.overview',
												params: { username: user.username },
											}"
										>
											{{ user.display_name }}
										</RouterLink>
										{{ ' ' }}
										<small>@{{ user.username }}</small>
									</h4>
									<p class="text-muted small">
										{{
											$gettext(`These are the games made by %{ user }.`, {
												user: user.display_name,
											})
										}}
									</p>
								</template>
							</template>

							<!--
								Owned Games
							-->
							<template v-else-if="type === 'owned'">
								<template v-if="collection.isOwner">
									<h1>
										{{ $gettext(`Your Owned Games`) }}
									</h1>
									<p class="text-muted small">
										{{ $gettext(`These are all the games you own.`) }}
									</p>
								</template>
								<template v-else-if="user">
									<h1>
										{{ $gettext(`Games Owned`) }}
									</h1>
									<h4>
										{{ $gettext(`by`) }}
										{{ ' ' }}
										<RouterLink
											class="link-unstyled"
											:to="{
												name: 'profile.overview',
												params: { username: user.username },
											}"
										>
											{{ user.display_name }}
										</RouterLink>
										{{ ' ' }}
										<small>@{{ user.username }}</small>
									</h4>
									<p class="text-muted small">
										{{
											$gettext(
												`These are all the games owned by %{ user }.`,
												{ user: user.display_name }
											)
										}}
									</p>
								</template>
							</template>

							<!--
								Recommended Games
							-->
							<template v-else-if="type === 'recommended'">
								<template v-if="collection.isOwner">
									<h1>
										{{ $gettext(`Your Daily Mix`) }}
									</h1>
									<p class="text-muted small">
										{{
											$gettext(
												`Every day we pick a handful of games that we think you may like!`
											)
										}}
									</p>
								</template>
								<template v-else-if="user">
									<h1>
										{{ $gettext(`Daily Mix`) }}
									</h1>
									<h4>
										{{ $gettext(`for`) }}
										{{ ' ' }}
										<RouterLink
											class="link-unstyled"
											:to="{
												name: 'profile.overview',
												params: { username: user.username },
											}"
										>
											{{ user.display_name }}
										</RouterLink>
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
									{{ $gettext(`by`) }}
									{{ ' ' }}
									<RouterLink
										class="link-unstyled"
										:to="{
											name: 'profile.overview',
											params: { username: playlist.user.username },
										}"
									>
										{{ playlist.user.display_name }}
									</RouterLink>
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
						</div>
					</transition>
				</div>
			</div>

			<template v-if="listing" #nav>
				<ul class="stat-list">
					<li v-if="shouldShowFollowers" class="stat-big stat-big-smaller">
						<div class="stat-big-label">
							{{ $gettext(`Followers`) }}
						</div>
						<div class="stat-big-digit">{{ formatNumber(followerCount) }}</div>
					</li>
					<li class="stat-big stat-big-smaller">
						<div class="stat-big-label">
							{{ $gettext(`Games`) }}
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
							{{ $gettext(`Edit Playlist`) }}
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
										{{ $gettext(`Remove Playlist`) }}
									</a>
								</div>
							</template>
						</AppPopper>
					</template>
				</AppPageHeaderControls>
			</template>
		</AppPageHeader>

		<AppGameListing
			v-if="listing && filtering"
			:listing="listing"
			:filtering="filtering"
			hide-section-nav
			:is-loading="isLoading"
			@load="loadMore"
		>
			<AppGameGrid
				v-if="listing"
				:games="listing.games"
				event-label="collection-games"
				:can-reorder="canReorder"
				@sort="$event => onSortedGames($event)"
			>
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
						{{ $gettext(`Recommended Games`) }}
					</h1>
					<div :class="{ 'pull-left': !Screen.isXs }">
						<p>
							{{
								$gettext(
									`We remixed this playlist into a tasty collection of other games that you may enjoy.`
								)
							}}
						</p>
						<hr class="underbar" />
					</div>
					<div class="hidden-xs pull-right">
						<AppButton @click="mixPlaylist(true)">
							{{ $gettext(`Refresh`) }}
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
						{{ $gettext(`Refresh`) }}
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
