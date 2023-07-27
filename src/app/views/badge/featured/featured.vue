<script lang="ts">
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { Game } from '../../../../_common/game/game.model';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../_common/route/legacy-route-component';
import FormGameFeaturedBadge from '../../../components/forms/game/featured-badge/featured-badge.vue';

@Options({
	name: 'RouteBadgeFeatured',
	components: {
		FormGameFeaturedBadge,
	},
})
@OptionsForLegacyRoute({
	lazy: true,
	cache: true,
	deps: { params: ['gameId'] },
	async resolver({ route }) {
		const payload = await Api.sendRequest('/web/discover/games/' + route.params.gameId);
		return payload;
	},
})
export default class RouteBadgeFeatured extends LegacyRouteComponent {
	game: Game | null = null;

	get routeTitle() {
		return 'Featured Badge';
	}

	routeResolved($payload: any) {
		this.game = new Game($payload.game);
	}
}
</script>

<template>
	<section class="section">
		<FormGameFeaturedBadge v-if="game" :game="game" />
	</section>
</template>

<style lang="stylus" scoped></style>
