<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { showSuccessGrowl } from '../../../../../../../_common/growls/growls.service';
import { BaseRouteComponent } from '../../../../../../../_common/route/route-component';
import { Scroll } from '../../../../../../../_common/scroll/scroll.service';
import { useCommonStore } from '../../../../../../../_common/store/common-store';
import AppGameDevStageSelector from '../../../../../../components/forms/game/dev-stage-selector/dev-stage-selector.vue';
import FormGame from '../../../../../../components/forms/game/game.vue';
import { useGameDashRouteController } from '../../manage.store';

@Options({
	name: 'RouteDashGamesManageGameDetails',
	components: {
		FormGame,
		AppGameDevStageSelector,
	},
})
export default class RouteDashGamesManageGameDetails extends BaseRouteComponent {
	routeStore = setup(() => useGameDashRouteController()!);
	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}

	get game() {
		return this.routeStore.game!;
	}

	get isWizard() {
		return this.routeStore.isWizard;
	}

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Edit Details for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	get isCollaborator() {
		return this.user!.id !== this.game.developer.id;
	}

	onSaved() {
		showSuccessGrowl(
			this.$gettext('dash.games.edit.save_growl'),
			this.$gettext('dash.games.edit.save_growl_title')
		);

		Scroll.to(0);
	}
}
</script>

<template>
	<div class="row">
		<div class="col-md-8">
			<template v-if="!isWizard && !isCollaborator">
				<h2 class="section-header">
					<translate>Development Stage</translate>
				</h2>

				<app-game-dev-stage-selector :game="game" />

				<hr />
			</template>

			<form-game :model="game" @submit="onSaved" />
		</div>
	</div>
</template>
