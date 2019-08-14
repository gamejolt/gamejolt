import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { Site } from '../../../../../_common/site/site-model';
import { Translate } from '../../../../../_common/translate/translate.service';
import AppSitesLinkCard from '../../../../components/sites/link-card/link-card.vue';
import AppSitesManagePage from '../../../../components/sites/manage-page/manage-page.vue';
import { routeStore, RouteStore, RouteStoreModule } from '../account.store';

@Component({
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
