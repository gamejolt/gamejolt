import { Route } from 'vue-router';
import { Component } from 'vue-property-decorator';
import View from '!view!./site.html?style=./site.styl';

import { RouteState, RouteStore } from '../manage.store';
import { Site } from '../../../../../../lib/gj-lib-client/components/site/site-model';
import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import { AppSitesLinkCard } from '../../../../../components/sites/link-card/link-card';
import { AppSitesManagePage } from '../../../../../components/sites/manage-page/manage-page';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDashGamesManageSite',
	components: {
		AppSitesLinkCard,
		AppSitesManagePage,
	},
})
export default class RouteDashGamesManageSite extends BaseRouteComponent {
	@RouteState game: RouteStore['game'];

	site: Site = null as any;

	@RouteResolve()
	routeResolve(this: undefined, route: Route) {
		return Api.sendRequest('/web/dash/sites/' + route.params.id);
	}

	get routeTitle() {
		return this.$gettext('Manage Site');
	}

	routed($payload: any) {
		this.site = new Site($payload.site);
	}
}
