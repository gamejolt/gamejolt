import View from '!view!./legal.html';
import { Component } from 'vue-property-decorator';
import { Ads, AdSettingsContainer } from '../../../lib/gj-lib-client/components/ad/ads.service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../lib/gj-lib-client/components/route/route-component';
import { User } from '../../../lib/gj-lib-client/components/user/user.model';

@View
@Component({
	name: 'RouteLegal',
})
export default class RouteLegal extends BaseRouteComponent {
	@RouteResolve({
		deps: {},
	})
	routeResolve() {
		return User.touch();
	}

	routeInit() {
		const settings = new AdSettingsContainer();
		settings.isPageDisabled = true;
		Ads.setPageSettings(settings);
	}

	routeDestroy() {
		Ads.releasePageSettings();
	}
}
