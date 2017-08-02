import { Component } from 'vue-property-decorator';
import * as View from '!view!./site.html';

import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { Site } from '../../../../../lib/gj-lib-client/components/site/site-model';
import { Meta } from '../../../../../lib/gj-lib-client/components/meta/meta-service';
import { AppSitesManagePage } from '../../../../components/sites/manage-page/manage-page';
import { AppSitesLinkCard } from '../../../../components/sites/link-card/link-card';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';

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

	@RouteResolve()
	routeResolve(this: undefined) {
		return Api.sendRequest('/web/dash/sites');
	}

	routeInit() {
		Meta.title = this.$gettext('Manage Site');
	}

	routed() {
		this.site = new Site(this.$payload.site);
	}
}
