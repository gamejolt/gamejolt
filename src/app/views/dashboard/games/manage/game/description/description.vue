<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../_common/api/api.service';
import { showSuccessGrowl } from '../../../../../../../_common/growls/growls.service';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../../_common/route/legacy-route-component';
import { Scroll } from '../../../../../../../_common/scroll/scroll.service';
import FormGameDescription from '../../../../../../components/forms/game/description/FormGameDescription.vue';
import { useGameDashRouteController } from '../../manage.store';

@Options({
	name: 'RouteDashGamesManageGameDescription',
	components: {
		FormGameDescription,
	},
})
@OptionsForLegacyRoute({
	deps: {},
	resolver: () => Api.sendRequest('/web/dash/developer/games/description'),
})
export default class RouteDashGamesManageGameDescription extends LegacyRouteComponent {
	routeStore = setup(() => useGameDashRouteController()!);

	get game() {
		return this.routeStore.game!;
	}

	tags: string[] = [];

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Edit Description for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.tags = $payload.tags || [];
	}

	onSaved() {
		showSuccessGrowl(
			this.$gettext(`Your game description has been saved.`),
			this.$gettext(`Description Saved`)
		);
		Scroll.to(0);
	}
}
</script>

<template>
	<div class="row">
		<div class="hidden-xs col-sm-4 col-sm-push-8">
			<div class="page-help">
				<h4>Writing a Good Description</h4>
				<p>
					<AppTranslate>
						A good description generally contains things like a gameplay summary,
						control overview, story, credits, etc. You can edit your description
						whenever you want and add to it over time.
					</AppTranslate>
				</p>
				<p>
					<AppTranslate>
						You can also upload images to use as in-context shots for your game or for
						stylized headings.
					</AppTranslate>
				</p>
			</div>
		</div>

		<div class="col-sm-8 col-sm-pull-4">
			<FormGameDescription :model="game" :tags="tags" @submit="onSaved" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
h4
	margin-top: 0
</style>
