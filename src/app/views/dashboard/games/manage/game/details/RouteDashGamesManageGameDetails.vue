<script lang="ts">
import { computed } from 'vue';
import { showSuccessGrowl } from '../../../../../../../_common/growls/growls.service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../../_common/route/route-component';
import { Scroll } from '../../../../../../../_common/scroll/scroll.service';
import { useCommonStore } from '../../../../../../../_common/store/common-store';
import { $gettext } from '../../../../../../../_common/translate/translate.service';
import AppGameDevStageSelector from '../../../../../../components/forms/game/dev-stage-selector/AppGameDevStageSelector.vue';
import FormGame from '../../../../../../components/forms/game/game.vue';
import { useGameDashRouteController } from '../../manage.store';

export default {
	...defineAppRouteOptions({}),
};
</script>

<script lang="ts" setup>
const { game, isWizard } = useGameDashRouteController()!;
const { user } = useCommonStore();

const isCollaborator = computed(() => user.value!.id !== game.value!.developer.id);

function onSaved() {
	showSuccessGrowl(
		$gettext('Your game details have been saved.'),
		$gettext('Game Details Saved')
	);

	Scroll.to(0);
}

createAppRoute({
	routeTitle: computed(() => {
		if (game.value) {
			return $gettext('Edit Details for %{ game }', {
				game: game.value.title,
			});
		}
		return null;
	}),
});
</script>

<template>
	<div class="row">
		<div class="col-md-8">
			<template v-if="!isWizard && !isCollaborator">
				<h2 class="section-header">
					{{ $gettext(`Development Stage`) }}
				</h2>

				<AppGameDevStageSelector :game="game" />

				<hr />
			</template>

			<FormGame :model="game" @submit="onSaved" />
		</div>
	</div>
</template>
