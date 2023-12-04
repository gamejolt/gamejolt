<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { GameModel } from '../../../../../../../_common/game/game.model';
import { showSuccessGrowl } from '../../../../../../../_common/growls/growls.service';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../../_common/route/legacy-route-component';
import { Screen } from '../../../../../../../_common/screen/screen-service';
import AppScrollAffix from '../../../../../../../_common/scroll/AppScrollAffix.vue';
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
@OptionsForLegacyRoute()
export default class RouteDashGamesManageGameMaturity extends LegacyRouteComponent {
	routeStore = setup(() => useGameDashRouteController()!);

	get game() {
		return this.routeStore.game!;
	}

	current: GameModel = null as any;

	readonly Screen = Screen;

	get routeTitle() {
		if (this.game) {
			return this.$gettext(`Edit Maturity Rating for %{ game }`, {
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
			this.$gettext(`Maturity Rating Saved`)
		);

		Scroll.to(0);
	}
}
</script>

<template>
	<div class="row">
		<div class="col-sm-5 col-sm-push-7">
			<AppScrollAffix v-if="current" :disabled="!Screen.isDesktop">
				<div v-if="current.tigrs_age" class="anim-fade-enter anim-fade-leave">
					<AppGameOgrs :game="current" />
				</div>
			</AppScrollAffix>

			<div class="page-help">
				<p>
					<AppTranslate>
						Every game on Game Jolt, even works-in-progress, needs a maturity rating to
						describe its content. Accurate ratings and details about content help gamers
						make informed decisions. Remember, you can always come back later and make
						changes.
					</AppTranslate>
				</p>
				<p>
					<AppLinkHelp page="dev-maturity-ratings" class="link-help">
						<AppTranslate>What is a maturity rating?</AppTranslate>
					</AppLinkHelp>
				</p>
			</div>
		</div>

		<div class="col-sm-7 col-sm-pull-5">
			<!--
			We set current whenever the form model changes so updates can be reflected in scroll affix and tigrs.
			-->
			<FormGameMaturity :model="game" @changed="current = $event" @submit="onSaved" />
		</div>
	</div>
</template>
