<script lang="ts">
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { Site } from '../../../../../_common/site/site-model';
import { Translate } from '../../../../../_common/translate/translate.service';
import AppSitesLinkCard from '../../../../components/sites/link-card/link-card.vue';
import AppSitesManagePage from '../../../../components/sites/manage-page/manage-page.vue';
import { routeStore, RouteStore, RouteStoreModule } from '../account.store';

@Options({
	name: 'RouteDashAccountSite',
	components: {
		AppSitesManagePage,
		AppSitesLinkCard,
	},
})
@RouteResolver({
	deps: {},
	resolver: () => Api.sendRequest('/web/dash/sites'),
	resolveStore({}) {
		routeStore.commit('setHeading', Translate.$gettext(`Manage Portfolio Site`));
	},
})
export default class RouteDashAccountSite extends BaseRouteComponent {
	@RouteStoreModule.State
	heading!: RouteStore['heading'];

	site?: Site = null as any;

	get routeTitle() {
		return this.heading;
	}

	routeResolved($payload: any) {
		this.site = new Site($payload.site);
	}
}
</script>

<template>
	<div class="row" v-if="isRouteBootstrapped">
		<div class="col-md-9 col-lg-8">
			<app-sites-manage-page :site="site" />
		</div>
		<div class="col-md-3 col-lg-4">
			<br class="hidden-lg" />

			<p class="page-help">
				<strong>
					<translate>
						Game Jolt Sites are customizable external sites for your portfolio and games!
					</translate>
				</strong>
				<translate>
					You can use a customizable template, or simply upload your own static site.
				</translate>
			</p>

			<p class="page-help">
				<translate>
					Sites don't replace your Game Jolt user profile page. You can use your Site URL to share
					your site with others.
				</translate>
			</p>

			<p class="page-help">
				<translate>You can set up a game site when managing your game.</translate>
			</p>

			<hr />

			<app-sites-link-card :site="site" />
		</div>
	</div>
</template>
