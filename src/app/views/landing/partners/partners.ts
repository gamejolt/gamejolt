import View from '!view!./partners.html';
import { Component } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';
import { AppThemeSvg } from '../../../../lib/gj-lib-client/components/theme/svg/svg';

@View
@Component({
	name: 'RouteLandingPartners',
	components: {
		AppThemeSvg,
	},
})
export default class RouteLandingPartners extends BaseRouteComponent {
	get routeTitle() {
		return `Become a Partner`;
	}
}
