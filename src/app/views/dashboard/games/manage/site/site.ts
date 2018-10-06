import View from '!view!./site.html?style=./site.styl';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../lib/gj-lib-client/components/route/route-component';
import { Site } from '../../../../../../lib/gj-lib-client/components/site/site-model';
import { AppSitesLinkCard } from '../../../../../components/sites/link-card/link-card';
import { AppSitesManagePage } from '../../../../../components/sites/manage-page/manage-page';
import { RouteState, RouteStore } from '../manage.store';

@View
@Component({
	name: 'RouteDashGamesManageSite',
	components: {
		AppSitesLinkCard,
		AppSitesManagePage,
	},
})
export default class RouteDashGamesManageSite extends BaseRouteComponent {
	@RouteState
	game!: RouteStore['game'];

	site: Site = null as any;

	@RouteResolve({
		deps: {},
	})
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
