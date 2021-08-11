import { CreateElement } from 'vue';
import { Component, Inject } from 'vue-property-decorator';
import {
	AppPromotionStore,
	AppPromotionStoreKey,
	setAppPromotionCohort,
} from '../../../../utils/mobile-app';
import { BaseRouteComponent } from '../../../../_common/route/route-component';

@Component({
	name: 'RouteDiscoverGames',
})
export default class RouteDiscoverGames extends BaseRouteComponent {
	@Inject({ from: AppPromotionStoreKey })
	appPromotion!: AppPromotionStore;

	routeCreated() {
		setAppPromotionCohort(this.appPromotion, 'store');
	}

	render(h: CreateElement) {
		return h('router-view');
	}
}
