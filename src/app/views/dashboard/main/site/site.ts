import View from '!view!./site.html';
import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import { Site } from '../../../../../lib/gj-lib-client/components/site/site-model';
import { AppSitesLinkCard } from '../../../../components/sites/link-card/link-card';
import { AppSitesManagePage } from '../../../../components/sites/manage-page/manage-page';

@View
@Component({
	name: 'RouteDashMainSite',
	components: {
		AppSitesManagePage,
		AppSitesLinkCard,
	},
})
export default class RouteDashMainSite extends BaseRouteComponent {
	site?: Site = null as any;

	@RouteResolve({
		deps: {},
	})
	routeResolve(this: undefined) {
		return Api.sendRequest('/web/dash/sites');
	}

	get routeTitle() {
		return this.$gettext('Manage Site');
	}

	routed($payload: any) {
		this.site = new Site($payload.site);
	}
}
