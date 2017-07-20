import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./site.html?style=./site.styl';

import { RouteState, RouteStore } from '../manage.state';
import { Meta } from '../../../../../../lib/gj-lib-client/components/meta/meta-service';
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
	components: {
		AppSitesLinkCard,
		AppSitesManagePage,
	},
})
export default class RouteDashGamesManageSite extends BaseRouteComponent {
	@RouteState game: RouteStore['game'];

	site: Site = null as any;

	@RouteResolve()
	routeResolve(this: undefined, route: VueRouter.Route) {
		return Api.sendRequest('/web/dash/sites/' + route.params.id);
	}

	routeInit() {
		Meta.title = this.$gettext('Manage Site');
	}

	routed() {
		this.site = new Site(this.$payload.site);
	}
}
