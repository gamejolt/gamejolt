<script lang="ts">
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import { Game } from '../../../../../_common/game/game.model';
import { BaseRouteComponent, OptionsForRoute } from '../../../../../_common/route/route-component';
import FormGame from '../../../../components/forms/game/game.vue';
import { startWizard } from '../manage/manage.store';

@Options({
	name: 'RouteDashGamesAdd',
	components: {
		FormGame,
	},
})
@OptionsForRoute({
	deps: {},
	// Make sure they can add a game.
	resolver: () => Api.sendRequest('/web/dash/developer/games/add'),
})
export default class RouteDashGamesAdd extends BaseRouteComponent {
	get routeTitle() {
		return this.$gettext('Add Game');
	}

	onSubmit(game: Game) {
		startWizard();

		this.$router.push({
			name: 'dash.games.manage.game.description',
			params: { id: game.id + '' },
		});
	}
}
</script>

<template>
	<section class="section">
		<div class="container">
			<div class="row">
				<div class="col-sm-10 col-md-8 col-lg-7 col-centered">
					<h1 class="section-header">
						<AppTranslate>Add a Game</AppTranslate>
					</h1>

					<FormGame @submit="onSubmit" />
				</div>
			</div>
		</div>
	</section>
</template>
