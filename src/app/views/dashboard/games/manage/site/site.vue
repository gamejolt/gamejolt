<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../_common/api/api.service';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../_common/route/legacy-route-component';
import { Site } from '../../../../../../_common/site/site-model';
import AppSitesLinkCard from '../../../../../components/sites/link-card/link-card.vue';
import AppSitesManagePage from '../../../../../components/sites/manage-page/manage-page.vue';
import { useGameDashRouteController } from '../manage.store';

@Options({
	name: 'RouteDashGamesManageSite',
	components: {
		AppSitesLinkCard,
		AppSitesManagePage,
	},
})
@OptionsForLegacyRoute({
	deps: {},
	resolver: ({ route }) => Api.sendRequest('/web/dash/sites/' + route.params.id),
})
export default class RouteDashGamesManageSite extends LegacyRouteComponent {
	routeStore = setup(() => useGameDashRouteController()!);

	get game() {
		return this.routeStore.game!;
	}

	site: Site = null as any;

	get routeTitle() {
		return this.$gettext('Manage Site');
	}

	routeResolved($payload: any) {
		this.site = new Site($payload.site);
	}
}
</script>

<template>
	<section v-if="isRouteBootstrapped" class="section">
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
						<AppSitesManagePage :site="site" :game="game" />
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
