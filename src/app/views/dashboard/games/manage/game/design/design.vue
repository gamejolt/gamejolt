<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../_common/api/api.service';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../../_common/route/legacy-route-component';
import { useThemeStore } from '../../../../../../../_common/theme/theme.store';
import FormGameDesign from '../../../../../../components/forms/game/design/design.vue';
import { ManageGameThemeKey, useGameDashRouteController } from '../../manage.store';

@Options({
	name: 'RouteDashGamesManageGameDesign',
	components: {
		FormGameDesign,
	},
})
@OptionsForLegacyRoute({
	deps: {},
	resolver: ({ route }) => Api.sendRequest('/web/dash/developer/games/media/' + route.params.id),
})
export default class RouteDashGamesManageGameDesign extends LegacyRouteComponent {
	routeStore = setup(() => useGameDashRouteController()!);
	themeStore = setup(() => useThemeStore());

	get game() {
		return this.routeStore.game!;
	}

	get media() {
		return this.routeStore.media;
	}

	get routeTitle() {
		if (this.game) {
			return this.$gettext(`Edit Design for %{ game }`, {
				game: this.game.title,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.routeStore.populateMedia($payload.mediaItems || []);
	}

	onSubmit() {
		this.themeStore.setPageTheme({
			key: ManageGameThemeKey,
			theme: this.game.theme ?? null,
		});
	}
}
</script>

<template>
	<div class="route-manage-game-design">
		<div class="row">
			<div class="col-md-9">
				<FormGameDesign :model="game" @submit="onSubmit" />
			</div>
		</div>
	</div>
</template>
