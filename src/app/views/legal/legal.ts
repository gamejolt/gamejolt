import { Component } from 'vue-property-decorator';
import { Ads } from '../../../_common/ad/ads.service';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import { User } from '../../../_common/user/user.model';

@Component({
	name: 'RouteLegal',
})
@RouteResolver({
	deps: {},
	resolver: () => User.touch(),
})
export default class RouteLegal extends BaseRouteComponent {
	private adDisabler!: unknown;

	routeCreated() {
		this.adDisabler = Ads.registerDisabler();
	}

	routeDestroyed() {
		Ads.deregisterDisabler(this.adDisabler);
	}
}
