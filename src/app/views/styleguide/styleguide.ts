import View from '!view!./styleguide.html';
import { Component } from 'vue-property-decorator';
import { AppButtonStyleguide } from '../../../lib/gj-lib-client/components/button/button-styleguide';
import { AppJolticonsStyleguide } from '../../../lib/gj-lib-client/components/jolticons/jolticons-styleguide';
import { AppListGroupStyleguide } from '../../../lib/gj-lib-client/components/list-group/list-group-styleguide';
import { AppProgressBarStyleguide } from '../../../lib/gj-lib-client/components/progress/bar/bar-styleguide';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../lib/gj-lib-client/components/route/route-component';
import { AppScrollAffix } from '../../../lib/gj-lib-client/components/scroll/affix/affix';
import { AppScrollTo } from '../../../lib/gj-lib-client/components/scroll/to/to.directive';
import { User } from '../../../lib/gj-lib-client/components/user/user.model';

@View
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
export default class RouteStyleguide extends BaseRouteComponent {
	@RouteResolve({
		deps: {},
	})
	async routeResolve() {
		User.touch();
	}

	get routeTitle() {
		return 'Styleguide';
	}
}
