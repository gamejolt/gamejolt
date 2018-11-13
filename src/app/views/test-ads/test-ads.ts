import View from '!view!./test-ads.html';
import { Component } from 'vue-property-decorator';
import { AppAd } from '../../../lib/gj-lib-client/components/ad/ad';
import { Prebid } from '../../../lib/gj-lib-client/components/ad/prebid.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteTestAds',
	components: {
		AppAd,
	},
})
// Gotta trigger the route resolve to load in ads.
@RouteResolver({
	async resolver({ route }) {
		route.query.AD_DEBUG = '';
		if (route.query.bidder) {
			Prebid.forcedBidder = route.query.bidder;
		}
	},
})
export default class RouteTestAds extends BaseRouteComponent {}
