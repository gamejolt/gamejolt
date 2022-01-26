<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Game } from '../../../../../../../_common/game/game.model';
import { showSuccessGrowl } from '../../../../../../../_common/growls/growls.service';
import { BaseRouteComponent } from '../../../../../../../_common/route/route-component';
import { Screen } from '../../../../../../../_common/screen/screen-service';
import AppScrollAffix from '../../../../../../../_common/scroll/affix/affix.vue';
import { Scroll } from '../../../../../../../_common/scroll/scroll.service';
import FormGameMaturity from '../../../../../../components/forms/game/maturity/maturity.vue';
import AppGameOgrs from '../../../../../../components/game/ogrs/ogrs.vue';
import { useGameDashRouteController } from '../../manage.store';

@Options({
	name: 'RouteDashGamesManageGameMaturity',
	components: {
		AppScrollAffix,
		AppGameOgrs,
		FormGameMaturity,
	},
})
export default class RouteDashGamesManageGameMaturity extends BaseRouteComponent {
	routeStore = setup(() => useGameDashRouteController()!);

	get game() {
		return this.routeStore.game!;
	}

	current: Game = null as any;

	readonly Screen = Screen;

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate(`Edit Maturity Rating for %{ game }`, {
				game: this.game.title,
			});
		}
		return null;
	}

	routeCreated() {
		this.current = this.game;
	}

	onSaved() {
		showSuccessGrowl(
			this.$gettext(`Your game's maturity information has been updated.`),
			this.$gettext(`dash.games.maturity.saved_growl_title`)
		);

		Scroll.to(0);
	}
}
</script>

<template>
	<div class="row">
		<div class="col-sm-5 col-sm-push-7">
			<app-scroll-affix v-if="current" :disabled="!Screen.isDesktop" :scroll-offset="15">
				<div v-if="current.tigrs_age" class="anim-fade-enter anim-fade-leave">
					<app-game-ogrs :game="current" />
				</div>
			</app-scroll-affix>

			<div class="page-help">
				<p>
					<translate>
						Every game on Game Jolt, even works-in-progress, needs a maturity rating to
						describe its content. Accurate ratings and details about content help gamers
						make informed decisions. Remember, you can always come back later and make
						changes.
					</translate>
				</p>
				<p>
					<app-link-help page="dev-maturity-ratings" class="link-help">
						<translate>dash.games.maturity.page_help_link</translate>
					</app-link-help>
				</p>
			</div>
		</div>

		<div class="col-sm-7 col-sm-pull-5">
			<!--
			We set current whenever the form model changes so updates can be reflected in scroll affix and tigrs.
			-->
			<form-game-maturity :model="game" @changed="current = $event" @submit="onSaved" />
		</div>
	</div>
</template>
