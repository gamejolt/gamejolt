import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';
import './forums-content.styl';

import { BaseRouteComponent } from '../../../lib/gj-lib-client/components/route/route-component';
import { Ads } from '../../../lib/gj-lib-client/components/ad/ads.service';

@Component({
	name: 'RouteForums',
})
export default class RouteForums extends BaseRouteComponent {
	render(h: CreateElement) {
		return h('router-view', { staticClass: 'route-forums' });
	}

	routeInit() {
		Ads.setAdUnit('forums');
	}
}
