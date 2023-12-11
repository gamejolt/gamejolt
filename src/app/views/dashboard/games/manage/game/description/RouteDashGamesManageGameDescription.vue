<script lang="ts">
import { computed, ref } from 'vue';
import { Api } from '../../../../../../../_common/api/api.service';
import { showSuccessGrowl } from '../../../../../../../_common/growls/growls.service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../../_common/route/route-component';
import { Scroll } from '../../../../../../../_common/scroll/scroll.service';
import { $gettext } from '../../../../../../../_common/translate/translate.service';
import FormGameDescription from '../../../../../../components/forms/game/description/FormGameDescription.vue';
import { useGameDashRouteController } from '../../manage.store';

export default {
	...defineAppRouteOptions({
		deps: {},
		resolver: () => Api.sendRequest('/web/dash/developer/games/description'),
	}),
};
</script>

<script lang="ts" setup>
const { game } = useGameDashRouteController()!;

const tags = ref<string[]>([]);

function onSaved() {
	showSuccessGrowl(
		$gettext(`Your game description has been saved.`),
		$gettext(`Description Saved`)
	);
	Scroll.to(0);
}

createAppRoute({
	routeTitle: computed(() => {
		if (game.value) {
			return $gettext('Edit Description for %{ game }', {
				game: game.value.title,
			});
		}
		return null;
	}),
	onResolved({ payload }) {
		tags.value = payload.tags || [];
	},
});
</script>

<template>
	<div class="row">
		<div class="hidden-xs col-sm-4 col-sm-push-8">
			<div class="page-help">
				<h4>Writing a Good Description</h4>
				<p>
					{{
						$gettext(
							`A good description generally contains things like a gameplay summary, control overview, story, credits, etc. You can edit your description whenever you want and add to it over time.`
						)
					}}
				</p>
				<p>
					{{
						$gettext(
							`You can also upload images to use as in-context shots for your game or for stylized headings.`
						)
					}}
				</p>
			</div>
		</div>

		<div class="col-sm-8 col-sm-pull-4">
			<FormGameDescription :model="game!" :tags="tags" @submit="onSaved" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
h4
	margin-top: 0
</style>
