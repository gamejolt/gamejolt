import View from '!view!./dashboard.html';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Ads, AdSettingsContainer } from '../../../lib/gj-lib-client/components/ad/ads.service';
import { BaseRouteComponent } from '../../../lib/gj-lib-client/components/route/route-component';
import { Store } from '../../store/index';

@View
@Component({
	name: 'RouteDash',
})
export default class RouteDash extends BaseRouteComponent {
	@State
	app!: Store['app'];

	routeCreated() {
		const adSettings = new AdSettingsContainer();
		adSettings.adUnit = 'user';
		Ads.setPageSettings(adSettings);
	}

	routeDestroyed() {
		Ads.releasePageSettings();
	}
}
