import { Component } from 'vue-property-decorator';
import View from '!view!./styleguide.html';

import { AppButtonStyleguide } from '../../../lib/gj-lib-client/components/button/button-styleguide';
import { AppScrollAffix } from '../../../lib/gj-lib-client/components/scroll/affix/affix';
import { User } from '../../../lib/gj-lib-client/components/user/user.model';
import { AppScrollTo } from '../../../lib/gj-lib-client/components/scroll/to/to.directive';
import { AppListGroupStyleguide } from '../../../lib/gj-lib-client/components/list-group/list-group-styleguide';
import { AppJolticonsStyleguide } from '../../../lib/gj-lib-client/components/jolticons/jolticons-styleguide';
import { AppProgressBarStyleguide } from '../../../lib/gj-lib-client/components/progress/bar/bar-styleguide';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../lib/gj-lib-client/components/route/route-component';

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
	@RouteResolve()
	async routeResolve() {
		User.touch();
	}

	get routeTitle() {
		return 'Styleguide';
	}
}
