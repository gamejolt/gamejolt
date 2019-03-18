import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Site } from 'game-jolt-frontend-lib/components/site/site-model';
import { Translate } from 'game-jolt-frontend-lib/components/translate/translate.service';
import { Component } from 'vue-property-decorator';
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
