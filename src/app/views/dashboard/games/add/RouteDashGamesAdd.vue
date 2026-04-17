<script lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import FormGame from '~app/components/forms/game/FormGame.vue';
import { startWizard } from '~app/views/dashboard/games/manage/manage.store';
import { Api } from '~common/api/api.service';
import { GameModel, handleGameAddFailure } from '~common/game/game.model';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import { useCommonStore } from '~common/store/common-store';
import { $gettext } from '~common/translate/translate.service';

export default {
	...defineAppRouteOptions({
		reloadOn: 'never',
		// Make sure they can add a game.
		resolver: () => Api.sendRequest('/web/dash/developer/games/add'),
	}),
};
</script>

<script lang="ts" setup>
const { user } = useCommonStore();
const router = useRouter();

function onSubmit(game: GameModel) {
	startWizard();

	router.push({
		name: 'dash.games.manage.game.description',
		params: { id: game.id + '' },
	});
}

createAppRoute({
	routeTitle: computed(() => $gettext('Add Game')),
	onResolved({ payload }) {
		if (payload.success === false) {
			console.log('Error status for adding game.', payload);

			handleGameAddFailure(user.value!, payload.reason, router);
		}
	},
});
</script>

<template>
	<section class="section">
		<div class="container">
			<div class="row">
				<div class="col-sm-10 col-md-8 col-lg-7 col-centered">
					<h1 class="section-header">
						{{ $gettext(`Add a Game`) }}
					</h1>

					<FormGame @submit="onSubmit" />
				</div>
			</div>
		</div>
	</section>
</template>
