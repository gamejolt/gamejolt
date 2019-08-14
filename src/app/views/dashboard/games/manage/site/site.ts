import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../../_common/api/api.service';
import { BaseRouteComponent, RouteResolver } from '../../../../../../_common/route/route-component';
import { Site } from '../../../../../../_common/site/site-model';
import AppSitesLinkCard from '../../../../sites/link-card/link-card.vue';
import AppSitesManagePage from '../../../../sites/manage-page/manage-page.vue';
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
