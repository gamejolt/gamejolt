import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { AppThemeSvg } from 'game-jolt-frontend-lib/components/theme/svg/svg';
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
