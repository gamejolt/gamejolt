<script lang="ts">
import { Api } from '../../../../../_common/api/api.service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';

export default {
	name: 'RouteProfileTrophiesOverview',
	...defineAppRouteOptions({
		reloadOn: 'never',
		resolver: ({ route }) =>
			Api.sendRequest('/web/profile/trophies/overview/@' + route.params.username),
	}),
};
</script>

<script lang="ts" setup>
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import AppButton from '../../../../../_common/button/AppButton.vue';
import AppLinkHelp from '../../../../../_common/link/AppLinkHelp.vue';
import { computed, ref } from 'vue';
import { GameModel } from '../../../../../_common/game/game.model';
import { useCommonStore } from '../../../../../_common/store/common-store';
import AppTimeAgo from '../../../../../_common/time/AppTimeAgo.vue';
import AppTimelineList from '../../../../../_common/timeline-list/AppTimelineList.vue';
import AppTimelineListItem from '../../../../../_common/timeline-list/item/AppTimelineListItem.vue';
import { showTrophyModal } from '../../../../../_common/trophy/modal/modal.service';
import AppTrophyThumbnail from '../../../../../_common/trophy/thumbnail/AppTrophyThumbnail.vue';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { UserGameTrophyModel } from '../../../../../_common/user/trophy/game-trophy.model';
import { UserSiteTrophyModel } from '../../../../../_common/user/trophy/site-trophy.model';
import { populateTrophies } from '../../../../../_common/user/trophy/trophy-utils';
import { UserBaseTrophyModel } from '../../../../../_common/user/trophy/user-base-trophy.model';
import { numberSort } from '../../../../../utils/array';
import { useProfileRouteStore } from '../../RouteProfile.vue';

type TrophyEntry = {
	gameId?: number;
	game?: GameModel;
	trophies: UserBaseTrophyModel[];
};

const { user } = useProfileRouteStore()!;
const { user: appUser } = useCommonStore();

const trophyEntries = ref<TrophyEntry[]>([]);

const canLoadMore = ref(false);
const isLoadingMore = ref(false);
let pageSize: number | undefined;

const hasTrophies = computed(() => trophyEntries.value.length > 0);

const isDev = computed(() => appUser.value && appUser.value.is_developer);

const isLoggedInUser = computed(
	() => user.value && appUser.value && appUser.value.id === user.value.id
);

function insertTrophy(userTrophy: UserBaseTrophyModel) {
	let game: GameModel | undefined = undefined;
	let gameId: number | undefined = undefined;
	if (userTrophy instanceof UserGameTrophyModel) {
		game = userTrophy.game;
		gameId = userTrophy.game_id;
	}
	let entry = trophyEntries.value
		.slice()
		.reverse()
		.find(i => i.gameId === gameId);
	if (entry) {
		const firstTrophy = entry.trophies[0];
		if (Math.abs(firstTrophy.logged_on - userTrophy.logged_on) > 24 * 60 * 60 * 1000) {
			entry = undefined;
		} else {
			entry.trophies.push(userTrophy);
		}
	}
	if (!entry) {
		entry = { game, gameId, trophies: [userTrophy] };
		trophyEntries.value.push(entry);
	}
}

function updateCanLoadMore(loadedTrophies: UserBaseTrophyModel[]) {
	if (!pageSize) {
		canLoadMore.value = false;
		return;
	}

	const loadedGameTrophies = loadedTrophies.filter(i => i instanceof UserGameTrophyModel);
	const loadedSiteTrophies = loadedTrophies.filter(i => i instanceof UserSiteTrophyModel);
	if (
		loadedGameTrophies.length < pageSize &&
		loadedSiteTrophies.length < pageSize
	) {
		canLoadMore.value = false;
		return;
	}

	const allTrophies = trophyEntries.value.flatMap(i => i.trophies);
	const gameTrophies = allTrophies.filter(i => i instanceof UserGameTrophyModel);
	const siteTrophies = allTrophies.filter(i => i instanceof UserSiteTrophyModel);

	canLoadMore.value =
		(loadedGameTrophies.length > 0 &&
			gameTrophies.length > 0 &&
			gameTrophies.length % pageSize === 0) ||
		(loadedSiteTrophies.length > 0 &&
			siteTrophies.length > 0 &&
			siteTrophies.length % pageSize === 0);
}

function sortEntries() {
	trophyEntries.value = trophyEntries.value.sort((a, b) =>
		numberSort(b.trophies[0].logged_on, a.trophies[0].logged_on)
	);
}

function onClickTrophy(userTrophy: UserBaseTrophyModel) {
	showTrophyModal(userTrophy);
}

async function onClickShowMore() {
	if (!user.value || !canLoadMore.value) {
		return;
	}

	isLoadingMore.value = true;

	let url = '/web/profile/trophies/overview/@' + user.value.username;

	let oldestGameTrophy: UserGameTrophyModel | null = null,
		oldestSiteTrophy: UserSiteTrophyModel | null = null;

	const allTrophies = trophyEntries.value.flatMap(i => i.trophies);

	for (const userTrophy of allTrophies) {
		if (userTrophy instanceof UserGameTrophyModel) {
			if (!oldestGameTrophy || oldestGameTrophy.logged_on > userTrophy.logged_on) {
				oldestGameTrophy = userTrophy;
			}
		} else if (userTrophy instanceof UserSiteTrophyModel) {
			if (!oldestSiteTrophy || oldestSiteTrophy.logged_on > userTrophy.logged_on) {
				oldestSiteTrophy = userTrophy;
			}
		}
	}

	if (oldestGameTrophy) {
		url += `?game-scroll=${oldestGameTrophy.logged_on}`;
	}
	if (oldestSiteTrophy) {
		url += oldestGameTrophy ? '&' : '?';
		url += `site-scroll=${oldestSiteTrophy.logged_on}`;
	}

	const payload = await Api.sendRequest(url);

	let trophies: UserBaseTrophyModel[] = [];
	if (payload.trophies) {
		trophies = populateTrophies(payload.trophies);
	}

	if (trophies.length === 0) {
		canLoadMore.value = false;
	} else {
		for (const userTrophy of trophies) {
			insertTrophy(userTrophy);
		}
		sortEntries();
		updateCanLoadMore(trophies);
	}

	isLoadingMore.value = false;
}

createAppRoute({
	routeTitle: computed(() => {
		if (user.value) {
			return $gettext(`@%{ user }'s Trophy Case`, {
				user: user.value.username,
			});
		}
		return null;
	}),
	onResolved({ payload }) {
		pageSize = payload.pageSize;

		let trophies: UserBaseTrophyModel[] = [];
		if (payload.trophies) {
			trophies = populateTrophies(payload.trophies);
		}

		if (trophies.length === 0) {
			canLoadMore.value = false;
		} else {
			for (const userTrophy of trophies) {
				insertTrophy(userTrophy);
			}
			sortEntries();
			updateCanLoadMore(trophies);
		}
	},
});
</script>

<template>
	<div>
		<div v-if="!hasTrophies" class="alert alert-info">
			<span>
				<AppTranslate>This user has not achieved any trophies ... yet.</AppTranslate>
			</span>
		</div>

		<AppTimelineList v-else>
			<div v-for="entry of trophyEntries" :key="entry.trophies[0].key">
				<AppTimelineListItem>
					<template #bubble>
						<div class="-timeline-icon">
							<AppJolticon v-if="entry.game" icon="trophy" />
							<AppJolticon v-else icon="gamejolt" />
						</div>
					</template>

					<div>
						<div class="timeline-list-item-title">
							<template v-if="entry.game">
								<template v-if="entry.trophies.length === 1">
									Achieved 1 trophy for the game
									<router-link
										:to="{
											name: 'profile.trophies.game',
											params: {
												id: entry.game.id,
											},
										}"
									>
										{{ entry.game.title }}
									</router-link>
								</template>
								<template v-else>
									Achieved {{ entry.trophies.length }} trophies for the game
									<router-link
										:to="{
											name: 'profile.trophies.game',
											params: {
												id: entry.game.id,
											},
										}"
									>
										{{ entry.game.title }}
									</router-link>
								</template>
							</template>
							<template v-else>
								<template v-if="entry.trophies.length === 1">
									Achieved 1
									<router-link :to="{ name: 'profile.trophies.site' }">
										Game Jolt Trophy
									</router-link>
								</template>
								<template v-else>
									Achieved {{ entry.trophies.length }}
									<router-link :to="{ name: 'profile.trophies.site' }">
										Game Jolt Trophies
									</router-link>
								</template>
							</template>
						</div>
					</div>

					<div class="timeline-list-item-meta">
						<AppTimeAgo :date="entry.trophies[0].logged_on" />
					</div>

					<div class="timeline-list-item-details">
						<div class="timeline-list-item-content">
							<AppTrophyThumbnail
								v-for="userTrophy of entry.trophies"
								:key="userTrophy.id"
								class="-trophy-thumb"
								:trophy="userTrophy.trophy!"
								:no-highlight="!!isLoggedInUser"
								@click="onClickTrophy(userTrophy)"
							/>
						</div>
					</div>
				</AppTimelineListItem>
				<div class="timeline-list-item-split" />
			</div>
			<p>
				<AppButton v-if="canLoadMore" :disabled="isLoadingMore" @click="onClickShowMore">
					<AppTranslate>Show More</AppTranslate>
				</AppButton>
				<router-link
					:to="{
						name: 'profile.trophies.all',
					}"
				>
					<AppButton>
						<AppTranslate>View all trophies</AppTranslate>
					</AppButton>
				</router-link>
			</p>
			<p v-if="isDev" class="-dev-trophy-link small">
				<AppLinkHelp page="dev-trophies" class="link-help">
					<AppTranslate>Learn how to integrate trophies into YOUR game!</AppTranslate>
				</AppLinkHelp>
			</p>
		</AppTimelineList>
	</div>
</template>

<style lang="stylus" scoped>
.-level-widget
	max-width: 340px
	width: 100%
	margin-right: 20px

.-trophy-header
	margin-bottom: 4px

.-dev-trophy-link
	margin-bottom: 24px

// Used to center the icon
::v-deep(.timeline-list-item-bubble-inner)
.timeline-list-item-bubble-inner > div
	position: relative
	height: 100%

.-timeline-icon
	display: flex
	position: relative
	height: 100%
	justify-content: center
	align-items: center

.-trophy-thumb
	display: inline-block
	width: 80px
	margin-right: 10px
	margin-bottom: 10px
	cursor: pointer

.-exp
	display: flex

	@media $media-xs
		flex-direction: column

		.-level-widget
			margin: 0
</style>
