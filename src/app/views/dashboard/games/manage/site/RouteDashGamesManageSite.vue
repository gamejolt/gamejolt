<script lang="ts">
import { computed, ref } from 'vue';

import AppSitesLinkCard from '~app/components/sites/link-card/AppSitesLinkCard.vue';
import AppSitesManagePage from '~app/components/sites/manage-page/AppSitesManagePage.vue';
import { useGameDashRouteController } from '~app/views/dashboard/games/manage/manage.store';
import { Api } from '~common/api/api.service';
import AppButton from '~common/button/AppButton.vue';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import { SiteModel } from '~common/site/site-model';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';

export default {
	name: 'RouteDashGamesManageSite',
	...defineAppRouteOptions({
		reloadOn: 'never',
		resolver: ({ route }) => Api.sendRequest('/web/dash/sites/' + route.params.id),
	}),
};
</script>

<script lang="ts" setup>
const routeStore = useGameDashRouteController()!;

const game = computed(() => routeStore.game.value!);

const site = ref<SiteModel>(null as any);

const appRoute = createAppRoute({
	routeTitle: computed(() => $gettext('Manage Site')),
	onResolved({ payload }) {
		site.value = new SiteModel(payload.site);
	},
});
</script>

<template>
	<section v-if="appRoute.isBootstrapped.value" class="section">
		<div class="container">
			<template v-if="!game.path">
				<div class="alert">
					<p>
						<AppTranslate>
							In order to set up a custom site for your game, you first have to set a
							URL path in your game details page.
						</AppTranslate>
					</p>
					<div class="alert-actions">
						<AppButton
							primary
							:to="{
								name: 'dash.games.manage.game.details',
								params: { id: game.id },
							}"
						>
							<AppTranslate>Edit Game Details</AppTranslate>
						</AppButton>
					</div>
				</div>
				<br />
				<br />
			</template>

			<div class="row">
				<div class="col-lg-8">
					<div :class="{ '-disabled': !game.path }">
						<AppSitesManagePage :site="site" :game="game!" />
					</div>
				</div>
				<div class="col-lg-4">
					<br class="hidden-lg" />

					<p class="page-help">
						<strong>
							<AppTranslate>
								Game Jolt Sites are customizable external sites for your portfolio
								and games!
							</AppTranslate>
						</strong>
						{{ ' ' }}
						<AppTranslate>
							You can use a customizable template, or simply upload your own static
							site.
						</AppTranslate>
					</p>

					<p class="page-help">
						<AppTranslate>
							Sites don't replace your Game Jolt game page. You can use your Site URL
							to share your site with others.
						</AppTranslate>
					</p>

					<p class="page-help">
						<router-link :to="{ name: 'dash.account.site' }">
							<AppTranslate>You can also create a user portfolio site.</AppTranslate>
						</router-link>
					</p>

					<hr />

					<AppSitesLinkCard v-if="game.path" :site="site" />
				</div>
			</div>
		</div>
	</section>
</template>

<style lang="stylus" scoped>
.-disabled
	opacity: 0.5
	pointer-events: none
	user-select: none
</style>
