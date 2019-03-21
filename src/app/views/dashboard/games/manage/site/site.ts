import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { BaseRouteComponent, RouteResolver } from 'game-jolt-frontend-lib/components/route/route-component';
import { Site } from 'game-jolt-frontend-lib/components/site/site-model';
import { Component } from 'vue-property-decorator';
import AppSitesLinkCard from '../../../../../components/sites/link-card/link-card.vue';
import AppSitesManagePage from '../../../../../components/sites/manage-page/manage-page.vue';
import { RouteStore, RouteStoreModule } from '../manage.store';

@Component({
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
	@RouteStoreModule.State
	game!: RouteStore['game'];

	site: Site = null as any;

	get routeTitle() {
		return this.$gettext('Manage Site');
	}

	routeResolved($payload: any) {
		this.site = new Site($payload.site);
	}
}
