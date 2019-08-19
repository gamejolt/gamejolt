import { Ads, AdSettingsContainer } from '../../../_common/ad/ads.service';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import { User } from '../../../_common/user/user.model';
import { Component } from 'vue-property-decorator';

@Component({
	name: 'RouteLegal',
})
@RouteResolver({
	deps: {},
	resolver: () => User.touch(),
})
export default class RouteLegal extends BaseRouteComponent {
	routeCreated() {
		const settings = new AdSettingsContainer();
		settings.isPageDisabled = true;
		Ads.setPageSettings(settings);
	}

	routeDestroyed() {
		Ads.releasePageSettings();
	}
}
