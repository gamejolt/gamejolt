<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../_common/api/api.service';
import { BaseRouteComponent, RouteResolver } from '../../../../../../_common/route/route-component';
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
@RouteResolver({
	deps: {},
	resolver: ({ route }) => Api.sendRequest('/web/dash/sites/' + route.params.id),
})
export default class RouteDashGamesManageSite extends BaseRouteComponent {
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
						<translate>
							In order to set up a custom site for your game, you first have to set a
							URL path in your game details page.
						</translate>
					</p>
					<div class="alert-actions">
						<app-button
							primary
							:to="{
								name: 'dash.games.manage.game.details',
								params: { id: game.id },
							}"
						>
							<translate>Edit Game Details</translate>
						</app-button>
					</div>
				</div>
				<br />
				<br />
			</template>

			<div class="row">
				<div class="col-lg-8">
					<div :class="{ '-disabled': !game.path }">
						<app-sites-manage-page :site="site" :game="game" />
					</div>
				</div>
				<div class="col-lg-4">
					<br class="hidden-lg" />

					<p class="page-help">
						<strong>
							<translate>
								Game Jolt Sites are customizable external sites for your portfolio
								and games!
							</translate>
						</strong>
						<translate>
							You can use a customizable template, or simply upload your own static
							site.
						</translate>
					</p>

					<p class="page-help">
						<translate>
							Sites don't replace your Game Jolt game page. You can use your Site URL
							to share your site with others.
						</translate>
					</p>

					<p class="page-help">
						<router-link :to="{ name: 'dash.account.site' }">
							<translate>You can also create a user portfolio site.</translate>
						</router-link>
					</p>

					<hr />

					<app-sites-link-card v-if="game.path" :site="site" />
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
