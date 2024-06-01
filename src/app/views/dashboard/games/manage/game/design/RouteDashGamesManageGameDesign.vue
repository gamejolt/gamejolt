<script lang="ts">
import { computed } from 'vue';
import { Api } from '../../../../../../../_common/api/api.service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../../_common/route/route-component';
import { useThemeStore } from '../../../../../../../_common/theme/theme.store';
import { $gettext } from '../../../../../../../_common/translate/translate.service';
import FormGameDesign from '../../../../../../components/forms/game/design/design.vue';
import { ManageGameThemeKey, useGameDashRouteController } from '../../manage.store';

export default {
	...defineAppRouteOptions({
		reloadOn: 'never',
		resolver: ({ route }) =>
			Api.sendRequest('/web/dash/developer/games/media/' + route.params.id),
	}),
};
</script>

<script lang="ts" setup>
const themeStore = useThemeStore();
const { game, populateMedia } = useGameDashRouteController()!;

function onSubmit() {
	themeStore.setPageTheme({
		key: ManageGameThemeKey,
		theme: game.value!.theme ?? null,
	});
}

createAppRoute({
	routeTitle: computed(() => {
		if (game.value) {
			return $gettext(`Edit Design for %{ game }`, {
				game: game.value.title,
			});
		}
		return null;
	}),
	onResolved({ payload }) {
		populateMedia(payload.mediaItems || []);
	},
});
</script>

<template>
	<div class="route-manage-game-design">
		<div class="row">
			<div class="col-md-9">
				<FormGameDesign :model="game!" @submit="onSubmit" />
			</div>
		</div>
	</div>
</template>
