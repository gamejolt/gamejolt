<script lang="ts">
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../_common/api/api.service';
import { showSuccessGrowl } from '../../../../../../../_common/growls/growls.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../_common/route/route-component';
import { Scroll } from '../../../../../../../_common/scroll/scroll.service';
import FormGameDescription from '../../../../../../components/forms/game/description/description.vue';
import { RouteStore, RouteStoreModule } from '../../manage.store';

@Options({
	name: 'RouteDashGamesManageGameDescription',
	components: {
		FormGameDescription,
	},
})
@RouteResolver({
	deps: {},
	resolver: () => Api.sendRequest('/web/dash/developer/games/description'),
})
export default class RouteDashGamesManageGameDescription extends BaseRouteComponent {
	@RouteStoreModule.State
	game!: RouteStore['game'];

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
					<translate>
						A good description generally contains things like a gameplay summary, control overview,
						story, credits, etc. You can edit your description whenever you want and add to it over
						time.
					</translate>
				</p>
				<p>
					<translate>
						You can also upload images to use as in-context shots for your game or for stylized
						headings.
					</translate>
				</p>
			</div>
		</div>

		<div class="col-sm-8 col-sm-pull-4">
			<form-game-description :model="game" :tags="tags" @submit="onSaved" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
h4
	margin-top: 0
</style>
