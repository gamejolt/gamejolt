import View from '!view!./site.html?style=./site.styl';
import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../lib/gj-lib-client/components/route/route-component';
import { Site } from '../../../../../../lib/gj-lib-client/components/site/site-model';
import { AppSitesLinkCard } from '../../../../../components/sites/link-card/link-card';
import { AppSitesManagePage } from '../../../../../components/sites/manage-page/manage-page';
import { RouteStore, RouteStoreModule } from '../manage.store';

@View
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
