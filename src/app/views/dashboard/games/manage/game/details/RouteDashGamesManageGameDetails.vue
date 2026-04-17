<script lang="ts">
import { computed } from 'vue';

import AppGameDevStageSelector from '~app/components/forms/game/dev-stage-selector/AppGameDevStageSelector.vue';
import FormGame from '~app/components/forms/game/FormGame.vue';
import { useGameDashRouteController } from '~app/views/dashboard/games/manage/manage.store';
import { showSuccessGrowl } from '~common/growls/growls.service';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import { Scroll } from '~common/scroll/scroll.service';
import { useCommonStore } from '~common/store/common-store';
import { $gettext } from '~common/translate/translate.service';

export default {
	...defineAppRouteOptions({
		reloadOn: 'always',
	}),
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
