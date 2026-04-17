<script lang="ts">
import { ref } from 'vue';

import AppShellPageBackdrop from '~app/components/shell/AppShellPageBackdrop.vue';
import AppProfileTrophiesNav, {
	TrophyNavGame,
} from '~app/views/profile/trophies/_nav/AppProfileTrophiesNav.vue';
import { Api } from '~common/api/api.service';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import { Screen } from '~common/screen/screen-service';
import { stringSort } from '~utils/array';

export default {
	name: 'RouteProfileTrophies',
	...defineAppRouteOptions({
		reloadOn: 'never',
		resolver: ({ route }) => Api.sendRequest('/web/profile/trophies/@' + route.params.username),
	}),
};
</script>

<script lang="ts" setup>
const games = ref<TrophyNavGame[]>([]);
const siteTrophyCount = ref(0);
const unviewedGames = ref<number[]>([]);

createAppRoute({
	onResolved({ payload }) {
		if (payload.games) {
			games.value = payload.games;
			games.value = games.value.sort((a, b) => stringSort(a.title, b.title));
		}
		siteTrophyCount.value = payload.siteTrophyCount || 0;
		if (payload.unviewedGames) {
			unviewedGames.value = payload.unviewedGames;
		}
	},
});
</script>

<template>
	<AppShellPageBackdrop>
		<section class="section">
			<div class="gj-container">
				<div class="row">
					<div v-if="Screen.isDesktop" class="col-md-3">
						<nav class="platform-list">
							<AppProfileTrophiesNav
								:games="games"
								:site-trophy-count="siteTrophyCount"
								:unviewed-games="unviewedGames"
							/>
						</nav>
					</div>
					<div class="col-xs-12 col-md-9">
						<router-view />
					</div>
				</div>
			</div>
		</section>
	</AppShellPageBackdrop>
</template>
