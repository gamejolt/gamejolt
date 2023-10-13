<script lang="ts">
export interface TrophyNavGame {
	id: number;
	trophyCount: number;
	title: string;
}
</script>

<script lang="ts" setup>
import { PropType, computed, toRefs } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { formatNumber } from '../../../../../_common/filters/number';
import AppListGroupSelector from '../../../../../_common/list-group/selector/AppListGroupSelector.vue';
import { useProfileRouteStore } from '../../RouteProfile.vue';

const props = defineProps({
	games: {
		type: Array as PropType<TrophyNavGame[]>,
		required: true,
	},
	siteTrophyCount: {
		type: Number,
		required: true,
	},
	unviewedGames: {
		type: Array as PropType<number[]>,
		required: true,
	},
});

const { trophyCount } = useProfileRouteStore()!;
const route = useRoute();
const router = useRouter();

const { games, unviewedGames } = toRefs(props);

const hasGames = computed(() => games.value.length > 0);

const currentGame = computed(() => {
	const id = parseInt(route.params.id as string, 10);
	return games.value.find(i => i.id === id);
});

function gameHasUnviewedTrophies(gameId: number) {
	return unviewedGames.value.includes(gameId);
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
