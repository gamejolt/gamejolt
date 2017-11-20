import { Route } from 'vue-router';
import { Component } from 'vue-property-decorator';
import View from '!view!./test-ads.html';

import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../lib/gj-lib-client/components/route/route-component';
import { Prebid } from '../../../lib/gj-lib-client/components/ad/prebid.service';
import { AppAd } from '../../../lib/gj-lib-client/components/ad/ad';

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
