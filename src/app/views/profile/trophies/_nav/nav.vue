<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { formatNumber } from '../../../../../_common/filters/number';
import AppListGroupSelector from '../../../../../_common/list-group/selector/selector.vue';
import { useProfileRouteStore } from '../../RouteProfile.vue';

export type TrophyNavGame = {
	id: number;
	trophyCount: number;
	title: string;
};

@Options({
	components: {
		AppListGroupSelector,
	},
})
export default class AppProfileTrophiesNav extends Vue {
	@Prop(Array)
	games!: TrophyNavGame[];

	@Prop(Number)
	siteTrophyCount!: number;

	@Prop(Array)
	unviewedGames!: number[];

	routeStore = setup(() => useProfileRouteStore()!);

	readonly formatNumber = formatNumber;

	get trophyCount() {
		return this.routeStore.trophyCount;
	}

	get hasGames() {
		return this.games.length > 0;
	}

	get currentGame() {
		const id = parseInt(this.$route.params.id as string, 10);
		return this.games.find(i => i.id === id);
	}

	gameHasUnviewedTrophies(gameId: number) {
		return this.unviewedGames.includes(gameId);
	}

	changeGame(game: TrophyNavGame) {
		this.$router.push({ name: 'profile.trophies.game', params: { id: game.id + '' } });
	}
}
</script>

<template>
	<nav>
		<ul class="sans-margin">
			<li>
				<router-link
					:to="{
						name: 'profile.trophies',
					}"
					exact-active-class="active"
				>
					<AppTranslate>Latest Activity</AppTranslate>
				</router-link>
			</li>
			<li>
				<router-link
					:to="{
						name: 'profile.trophies.all',
					}"
					exact-active-class="active"
				>
					<AppTranslate>All Trophies</AppTranslate>
					<span class="badge">{{ formatNumber(trophyCount) }}</span>
				</router-link>
			</li>
			<li>
				<router-link
					:to="{
						name: 'profile.trophies.site',
					}"
					exact-active-class="active"
				>
					<AppTranslate>Game Jolt Trophies</AppTranslate>
					<span class="badge">{{ formatNumber(siteTrophyCount) }}</span>
				</router-link>
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
					<AppTranslate v-if="!item">Choose a game...</AppTranslate>
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
