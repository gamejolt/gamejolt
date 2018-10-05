import View from '!view!./test-ads.html';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { AppAd } from '../../../lib/gj-lib-client/components/ad/ad';
import { Prebid } from '../../../lib/gj-lib-client/components/ad/prebid.service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteTestAds',
	components: {
		AppAd,
	},
})
export default class RouteTestAds extends BaseRouteComponent {
	// Gotta trigger the route resolve to load in ads.
	@RouteResolve()
	async routeResolve(this: undefined, route: Route) {
		route.query.AD_DEBUG = '';
		if (route.query.bidder) {
			Prebid.forcedBidder = route.query.bidder;
		}
		return;
	}
}
