import { Component } from 'vue-property-decorator';
import View from '!view!./legal.html';

import { User } from '../../../lib/gj-lib-client/components/user/user.model';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../lib/gj-lib-client/components/route/route-component';
import { Ads } from '../../../lib/gj-lib-client/components/ad/ads.service';

@View
@Component({
	name: 'RouteLegal',
})
export default class RouteLegal extends BaseRouteComponent {
	@RouteResolve()
	routeResolve() {
		return User.touch();
	}

	routeInit() {
		Ads.isPageDisabled = true;
	}
}
