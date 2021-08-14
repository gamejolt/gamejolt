import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import {
	AdSettingsContainer,
	releasePageAdsSettings,
	setPageAdsSettings,
	useAdsController,
} from '../../../_common/ad/ad-store';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import { User } from '../../../_common/user/user.model';

@Options({
	name: 'RouteLegal',
})
@RouteResolver({
	deps: {},
	resolver: () => User.touch(),
})
export default class RouteLegal extends BaseRouteComponent {
	ads = setup(() => useAdsController());

	routeCreated() {
		const settings = new AdSettingsContainer();
		settings.isPageDisabled = true;
		setPageAdsSettings(this.ads, settings);
	}

	routeDestroyed() {
		releasePageAdsSettings(this.ads);
	}
}
