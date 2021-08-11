import { Options } from 'vue-property-decorator';
import { AdSettingsContainer } from '../../../_common/ad/ad-store';
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
	routeCreated() {
		const settings = new AdSettingsContainer();
		settings.isPageDisabled = true;
		this.$ad.setPageSettings(settings);
	}

	routeDestroyed() {
		this.$ad.releasePageSettings();
	}
}
