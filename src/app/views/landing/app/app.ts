import { Component } from 'vue-property-decorator';
import AppAppButtons from '../../../../_common/app-buttons/app-buttons.vue';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';

@Component({
	name: 'RouteLandingApp',
	components: {
		AppAppButtons,
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	deps: {},
})
export default class RouteLandingApp extends BaseRouteComponent {
	disableRouteTitleSuffix = true;

	get routeTitle() {
		return `Game Jolt Mobile App`;
	}
}
