<script lang="ts">
import { computed, ref } from 'vue';
import { GameModel } from '../../../../../../../_common/game/game.model';
import { showSuccessGrowl } from '../../../../../../../_common/growls/growls.service';
import AppLinkHelp from '../../../../../../../_common/link/AppLinkHelp.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../../_common/route/route-component';
import { Screen } from '../../../../../../../_common/screen/screen-service';
import AppScrollAffix from '../../../../../../../_common/scroll/AppScrollAffix.vue';
import { Scroll } from '../../../../../../../_common/scroll/scroll.service';
import { $gettext } from '../../../../../../../_common/translate/translate.service';
import FormGameMaturity from '../../../../../../components/forms/game/maturity/maturity.vue';
import AppGameOgrs from '../../../../../../components/game/ogrs/AppGameOgrs.vue';
import { useGameDashRouteController } from '../../manage.store';

export default {
	...defineAppRouteOptions({
		reloadOn: 'always',
	}),
};
</script>

<script lang="ts" setup>
const { game } = useGameDashRouteController()!;

const current = ref<GameModel>(null as any);

function onSaved() {
	showSuccessGrowl(
		$gettext(`Your game's maturity information has been updated.`),
		$gettext(`Maturity Rating Saved`)
	);

	Scroll.to(0);
}

createAppRoute({
	routeTitle: computed(() => {
		if (game.value) {
			return $gettext(`Edit Maturity Rating for %{ game }`, {
				game: game.value.title,
			});
		}
		return null;
	}),
	onInit() {
		current.value = game.value!;
	},
});
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
					{{
						$gettext(
							`Every game on Game Jolt, even works-in-progress, needs a maturity rating to describe its content. Accurate ratings and details about content help gamers make informed decisions. Remember, you can always come back later and make changes.`
						)
					}}
				</p>
				<p>
					<AppLinkHelp page="dev-maturity-ratings" class="link-help">
						{{ $gettext(`What is a maturity rating?`) }}
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
