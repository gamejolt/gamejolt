import AppButtonStyleguide from 'game-jolt-frontend-lib/components/button/button-styleguide.vue';
import AppJolticonsStyleguide from 'game-jolt-frontend-lib/components/jolticons/jolticons-styleguide.vue';
import AppListGroupStyleguide from 'game-jolt-frontend-lib/components/list-group/list-group-styleguide.vue';
import AppProgressBarStyleguide from 'game-jolt-frontend-lib/components/progress/bar/bar-styleguide.vue';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import AppScrollAffix from 'game-jolt-frontend-lib/components/scroll/affix/affix.vue';
import { AppScrollTo } from 'game-jolt-frontend-lib/components/scroll/to/to.directive';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import { Component } from 'vue-property-decorator';

@Component({
	name: 'RouteStyleguide',
	components: {
		AppScrollAffix,
		AppButtonStyleguide,
		AppListGroupStyleguide,
		AppProgressBarStyleguide,
		AppJolticonsStyleguide,
	},
	directives: {
		AppScrollTo,
	},
})
@RouteResolver({
	deps: {},
	resolver: () => User.touch(),
})
export default class RouteStyleguide extends BaseRouteComponent {
	get routeTitle() {
		return 'Styleguide';
	}
}
