import { h } from 'vue';
import { Inject, Options } from 'vue-property-decorator';
import {
	AppPromotionStore,
	AppPromotionStoreKey,
	setAppPromotionCohort,
} from '../../../../utils/mobile-app';
import { BaseRouteComponent } from '../../../../_common/route/route-component';

@Options({
	name: 'RouteDiscoverGames',
})
export default class RouteDiscoverGames extends BaseRouteComponent {
	@Inject({ from: AppPromotionStoreKey })
	appPromotion!: AppPromotionStore;

	routeCreated() {
		setAppPromotionCohort(this.appPromotion, 'store');
	}

	render() {
		return h('router-view');
	}
}
