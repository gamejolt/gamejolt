import { Ads, AdSettingsContainer } from 'game-jolt-frontend-lib/components/ad/ads.service';
import { BaseRouteComponent, RouteResolver } from 'game-jolt-frontend-lib/components/route/route-component';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
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
