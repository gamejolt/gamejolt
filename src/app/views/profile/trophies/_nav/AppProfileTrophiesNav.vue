<script lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';

import { useProfileRouteStore } from '~app/views/profile/RouteProfile.vue';
import { formatNumber } from '~common/filters/number';
import AppListGroupSelector from '~common/list-group/selector/AppListGroupSelector.vue';

export interface TrophyNavGame {
	id: number;
	trophyCount: number;
	title: string;
}
</script>

<script lang="ts" setup>
type Props = {
	games: TrophyNavGame[];
	siteTrophyCount: number;
	unviewedGames: number[];
};
const { games, unviewedGames } = defineProps<Props>();

const { trophyCount } = useProfileRouteStore()!;
const route = useRoute();
const router = useRouter();

const hasGames = computed(() => games.length > 0);

const currentGame = computed(() => {
	const id = parseInt(route.params.id as string, 10);
	return games.find(i => i.id === id);
});

function gameHasUnviewedTrophies(gameId: number) {
	return unviewedGames.includes(gameId);
}

function changeGame(game: TrophyNavGame) {
	router.push({ name: 'profile.trophies.game', params: { id: game.id + '' } });
}
</script>

<template>
	<nav>
		<ul class="sans-margin">
			<li>
				<RouterLink
					:to="{
						name: 'profile.trophies',
					}"
					exact-active-class="active"
				>
					{{ $gettext(`Latest Activity`) }}
				</RouterLink>
			</li>
			<li>
				<RouterLink
					:to="{
						name: 'profile.trophies.all',
					}"
					exact-active-class="active"
				>
					{{ $gettext(`All Trophies`) }}

					<span class="badge">{{ formatNumber(trophyCount) }}</span>
				</RouterLink>
			</li>
			<li>
				<RouterLink
					:to="{
						name: 'profile.trophies.site',
					}"
					exact-active-class="active"
				>
					{{ $gettext(`Game Jolt Trophies`) }}
					<span class="badge">{{ formatNumber(siteTrophyCount) }}</span>
				</RouterLink>
			</li>
		</ul>
		<template v-if="hasGames">
			<hr />
			<AppListGroupSelector
				:items="games"
				:current="currentGame"
				@change="changeGame($event)"
			>
				<template #default="{ item }">
					<template v-if="!item">
						{{ $gettext(`Choose a game...`) }}
					</template>
					<template v-else>
						<span
							class="badge"
							:class="{ 'badge-notice': gameHasUnviewedTrophies(item.id) }"
						>
							{{ formatNumber(item.trophyCount) }}
						</span>
						{{ item.title }}
					</template>
				</template>
			</AppListGroupSelector>
		</template>
	</nav>
</template>
