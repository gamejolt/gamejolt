<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { trackSearch, trackSearchAutocomplete } from '../../../_common/analytics/analytics.service';
import { CommunityModel } from '../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../_common/community/thumbnail/AppCommunityThumbnailImg.vue';
import { GameModel } from '../../../_common/game/game.model';
import AppGameThumbnailImg from '../../../_common/game/thumbnail/AppGameThumbnailImg.vue';
import AppRealmThumbnail from '../../../_common/realm/AppRealmThumbnail.vue';
import { RealmModel } from '../../../_common/realm/realm-model';
import AppUserVerifiedTick from '../../../_common/user/AppUserVerifiedTick.vue';
import AppUserAvatarImg from '../../../_common/user/user-avatar/AppUserAvatarImg.vue';
import { UserModel } from '../../../_common/user/user.model';
import { debounce } from '../../../utils/utils';
import type { LocalDbGame as LocalDbGameType } from '../client/local-db/game/game.model';
import { LocalDbGame } from '../client/safe-exports';
import { SearchKeydownSpy, useSearchController } from './AppSearch.vue';
import { sendSearch } from './search-service';

const KEYCODE_UP = 38;
const KEYCODE_DOWN = 40;
const KEYCODE_ENTER = 13;

const router = useRouter();
const { isEmpty, query, setKeydownSpy, removeKeydownSpy, focusToken } = useSearchController()!;

const selected = ref(0);
const realms = ref<RealmModel[]>([]);
const communities = ref<CommunityModel[]>([]);
const games = ref<GameModel[]>([]);
const users = ref<UserModel[]>([]);
const libraryGames = ref<LocalDbGameType[]>([]);

const isHidden = computed(() => isEmpty.value);

/**
 * All items so we can calculate global selection indexes easily.
 * This needs to be in the order that they will show in the results list.
 */
const items = computed(() => [
	...realms.value,
	...communities.value,
	...libraryGames.value,
	...games.value,
	...users.value,
]);

const _keydownSpy: SearchKeydownSpy = event => {
	const min = 0;
	const max = items.value.length;

	if (event.keyCode === KEYCODE_DOWN) {
		selected.value = Math.min(selected.value + 1, max);
	} else if (event.keyCode === KEYCODE_UP) {
		selected.value = Math.max(selected.value - 1, min);
	} else if (event.keyCode === KEYCODE_ENTER) {
		selectActive();
	}
};

// We want to debounce searches.
const onChange = debounce((query: string) => {
	// Reset the selected index.
	selected.value = 0;

	if (isEmpty.value) {
		return;
	}

	_sendSearch(query);
}, 500);

watch(query, onChange);

onMounted(() => {
	setKeydownSpy(_keydownSpy);

	// Trigger the initial onChange so any query will show again.
	onChange(query.value);
});

onUnmounted(() => {
	removeKeydownSpy(_keydownSpy);
});

async function _sendSearch(newQuery: string) {
	if (isEmpty.value) {
		return;
	}

	trackSearch({ query: newQuery });

	// We store the query that we're waiting on.
	const payload = await sendSearch(newQuery, { type: 'typeahead' });

	// We only update the payload if the query is still the same as when we sent.
	// This makes sure we don't step on ourselves while typing fast.
	// Payloads may not come back sequentially.
	if (query.value !== newQuery) {
		return;
	}

	realms.value = payload.realms.slice(0, 3);
	communities.value = payload.communities.slice(0, 1);
	games.value = payload.games.slice(0, 2);
	users.value = payload.users.slice(0, 2);
	libraryGames.value = payload.libraryGames.slice(0, 3);
}

function selectActive() {
	if (isEmpty.value) {
		return;
	}

	// Selected the "show all results" option.
	if (selected.value === 0) {
		viewAll();
	} else {
		const item = items.value[selected.value - 1];
		if (item instanceof RealmModel) {
			selectRealm(item);
		} else if (item instanceof CommunityModel) {
			selectCommunity(item);
		} else if (item instanceof GameModel) {
			selectGame(item);
		} else if (item instanceof UserModel) {
			selectUser(item);
		} else if (LocalDbGame) {
			if (item instanceof LocalDbGame) {
				selectLibraryGame(item);
			}
		}
	}

	focusToken.blur();
}

function viewAll() {
	router.push({
		name: 'search.results',
		query: { q: query.value },
	});

	trackSearchAutocomplete({
		query: query.value,
		search_autocomplete_resource: 'all',
	});
}

function selectRealm(realm: RealmModel) {
	router.push(realm.routeLocation);

	trackSearchAutocomplete({
		query: query.value,
		search_autocomplete_resource: 'realm',
	});
}

function selectCommunity(community: CommunityModel) {
	router.push(community.routeLocation);

	trackSearchAutocomplete({
		query: query.value,
		search_autocomplete_resource: 'community',
	});
}

function selectGame(game: GameModel) {
	router.push({
		name: 'discover.games.view.overview',
		params: { slug: game.slug, id: game.id + '' },
	});

	trackSearchAutocomplete({
		query: query.value,
		search_autocomplete_resource: 'game',
	});
}

function selectUser(user: UserModel) {
	router.push({
		name: 'profile.overview',
		params: { username: user.username },
	});

	trackSearchAutocomplete({
		query: query.value,
		search_autocomplete_resource: 'user',
	});
}

function selectLibraryGame(localGame: LocalDbGameType) {
	router.push({
		name: 'discover.games.view.overview',
		params: { slug: localGame.slug, id: localGame.id + '' },
	});

	trackSearchAutocomplete({
		query: query.value,
		search_autocomplete_resource: 'library_game',
	});
}
</script>

<template>
	<div class="search-autocomplete-popover fill-darkest">
		<div v-if="isHidden" class="well sans-margin-bottom">
			{{ $gettext(`Enter your search query for maximum finding...`) }}
		</div>
		<template v-else>
			<!-- View All -->
			<div class="list-group list-group-dark">
				<a
					class="list-group-item"
					:class="{ active: selected === 0 }"
					@mousedown="viewAll()"
				>
					{{ $gettext(`Show all results...`) }}
				</a>
			</div>

			<!-- Installed Games -->
			<template v-if="libraryGames.length">
				<div class="-heading">
					{{ $gettext(`Installed games`) }}
				</div>
				<div class="list-group list-group-dark thin">
					<RouterLink
						v-for="libraryGame of libraryGames"
						:key="libraryGame.id"
						class="-item -game list-group-item"
						:to="{
							name: 'discover.games.view.overview',
							params: { slug: libraryGame.slug, id: libraryGame.id },
						}"
						:class="{ active: items[selected - 1] === libraryGame }"
					>
						<span class="-thumb">
							<AppGameThumbnailImg
								radius="md"
								hide-jolticon
								:game="(libraryGame as any)"
							/>
						</span>

						{{ libraryGame.title }}
					</RouterLink>
				</div>
			</template>

			<!-- Realms -->
			<template v-if="realms.length">
				<div class="-heading">
					{{ $gettext(`Realms`) }}
				</div>
				<div class="list-group list-group-dark thin">
					<RouterLink
						v-for="realm of realms"
						:key="realm.id"
						class="-item -realm list-group-item"
						:to="realm.routeLocation"
						:class="{ active: items[selected - 1] === realm }"
					>
						<span class="-thumb">
							<AppRealmThumbnail :realm="realm" />
						</span>

						{{ realm.name }}
					</RouterLink>
				</div>
			</template>

			<!-- Communities -->
			<template v-if="communities.length">
				<div class="-heading">
					{{ $gettext(`Communities`) }}
				</div>
				<div class="list-group list-group-dark thin">
					<RouterLink
						v-for="community of communities"
						:key="community.id"
						class="-item -community list-group-item"
						:to="community.routeLocation"
						:class="{ active: items[selected - 1] === community }"
					>
						<span class="-thumb">
							<AppCommunityThumbnailImg :community="community" />
						</span>

						{{ community.name }}
					</RouterLink>
				</div>
			</template>

			<!-- Games -->
			<template v-if="games.length">
				<div class="-heading">
					{{ $gettext(`Games`) }}
				</div>
				<div class="list-group list-group-dark thin">
					<RouterLink
						v-for="game of games"
						:key="game.id"
						class="-item -game list-group-item"
						:to="{
							name: 'discover.games.view.overview',
							params: { slug: game.slug, id: game.id },
						}"
						:class="{ active: items[selected - 1] === game }"
					>
						<span class="-thumb">
							<AppGameThumbnailImg radius="md" hide-jolticon :game="game" />
						</span>

						{{ game.title }}
					</RouterLink>
				</div>
			</template>

			<!-- Users -->
			<template v-if="users.length">
				<div class="-heading">
					{{ $gettext(`Users`) }}
				</div>
				<div class="list-group list-group-dark thin">
					<RouterLink
						v-for="user of users"
						:key="user.id"
						class="-item -user list-group-item"
						:to="{
							name: 'profile.overview',
							params: { username: user.username },
						}"
						:class="{ active: items[selected - 1] === user }"
					>
						<span class="-thumb">
							<AppUserAvatarImg :user="user" />
						</span>

						<AppUserVerifiedTick :user="user" small />
						<span>
							{{ user.display_name }}
							{{ ' ' }}
							<span class="tiny text-muted">@{{ user.username }}</span>
						</span>
					</RouterLink>
				</div>
			</template>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.-heading
	margin-left: $list-group-item-padding
	font-weight: bold

.-item
	display: flex
	flex-direction: row
	align-items: center

.-thumb
	display: block
	flex: none
	width: 20px
	margin-right: 8px

.-realm .-thumb
	width: 30px

.-game .-thumb
	width: 36px
</style>
