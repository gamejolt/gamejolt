import AppButtonStyleguide from '../../../_common/button/button-styleguide.vue';
import AppJolticonsStyleguide from '../../../_common/jolticons/jolticons-styleguide.vue';
import AppListGroupStyleguide from '../../../_common/list-group/list-group-styleguide.vue';
import AppProgressBarStyleguide from '../../../_common/progress/bar/bar-styleguide.vue';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import AppScrollAffix from '../../../_common/scroll/affix/affix.vue';
import { AppScrollTo } from '../../../_common/scroll/to/to.directive';
import { User } from '../../../_common/user/user.model';
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

	get nav() {
		return {
			buttons: 'Buttons',
			'list-groups': 'List Groups',
			'progress-bars': 'Progress Bars',
			jolticons: 'Jolticons',
		};
	}

	get components() {
		return [
			AppButtonStyleguide,
			AppListGroupStyleguide,
			AppProgressBarStyleguide,
			AppJolticonsStyleguide,
		];
	}
}
