<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import { Game, handleGameAddFailure } from '../../../../../_common/game/game.model';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../_common/route/legacy-route-component';
import { useCommonStore } from '../../../../../_common/store/common-store';
import FormGame from '../../../../components/forms/game/game.vue';
import { startWizard } from '../manage/manage.store';

@Options({
	name: 'RouteDashGamesAdd',
	components: {
		FormGame,
	},
})
@OptionsForLegacyRoute({
	deps: {},
	// Make sure they can add a game.
	resolver: () => Api.sendRequest('/web/dash/developer/games/add'),
})
export default class RouteDashGamesAdd extends LegacyRouteComponent {
	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}

	get routeTitle() {
		return this.$gettext('Add Game');
	}

	routeResolved(payload: any): void {
		if (payload.success === false) {
			console.log('Error status for adding game.', payload);

			handleGameAddFailure(this.user!, payload.reason, this.$router);
		}
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
