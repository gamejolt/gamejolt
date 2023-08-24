<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { showSuccessGrowl } from '../../../../../../../_common/growls/growls.service';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../../_common/route/legacy-route-component';
import { Scroll } from '../../../../../../../_common/scroll/scroll.service';
import { useCommonStore } from '../../../../../../../_common/store/common-store';
import AppGameDevStageSelector from '../../../../../../components/forms/game/dev-stage-selector/AppGameDevStageSelector.vue';
import FormGame from '../../../../../../components/forms/game/game.vue';
import { useGameDashRouteController } from '../../manage.store';

@Options({
	name: 'RouteDashGamesManageGameDetails',
	components: {
		FormGame,
		AppGameDevStageSelector,
	},
})
@OptionsForLegacyRoute()
export default class RouteDashGamesManageGameDetails extends LegacyRouteComponent {
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
			this.$gettext('Your game details have been saved.'),
			this.$gettext('Game Details Saved')
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
					<AppTranslate>Development Stage</AppTranslate>
				</h2>

				<AppGameDevStageSelector :game="game" />

				<hr />
			</template>

			<FormGame :model="game" @submit="onSaved" />
		</div>
	</div>
</template>
