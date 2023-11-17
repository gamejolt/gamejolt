<script lang="ts">
import { computed, ref } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import { GameModel } from '../../../../_common/game/game.model';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import FormGameFeaturedBadge from '../../../components/forms/game/featured-badge/featured-badge.vue';

export default {
	...defineAppRouteOptions({
		lazy: true,
		cache: true,
		deps: { params: ['gameId'] },
		async resolver({ route }) {
			const payload = await Api.sendRequest('/web/discover/games/' + route.params.gameId);
			return payload;
		},
	}),
};
</script>

<script lang="ts" setup>
const game = ref<GameModel | null>(null);

createAppRoute({
	routeTitle: computed(() => `Featured Badge`),
	onResolved({ payload }) {
		game.value = new GameModel(payload.game);
	},
});
</script>

<template>
	<section class="section">
		<FormGameFeaturedBadge v-if="game" :game="game" />
	</section>
</template>
