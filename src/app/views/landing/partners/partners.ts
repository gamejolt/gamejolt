import { BaseRouteComponent } from '../../../../_common/route/route-component';
import { AppThemeSvg } from '../../../../_common/theme/svg/svg';
import { Component } from 'vue-property-decorator';

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
