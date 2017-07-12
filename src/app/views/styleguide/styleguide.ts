import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./styleguide.html';

import { AppButtonStyleguide } from '../../../lib/gj-lib-client/components/button/button-styleguide';
import { AppScrollAffix } from '../../../lib/gj-lib-client/components/scroll/affix/affix';
import { Meta } from '../../../lib/gj-lib-client/components/meta/meta-service';
import { RouteResolve } from '../../../lib/gj-lib-client/utils/router';
import { User } from '../../../lib/gj-lib-client/components/user/user.model';
import { AppScrollTo } from '../../../lib/gj-lib-client/components/scroll/to/to.directive';
import { AppListGroupStyleguide } from '../../../lib/gj-lib-client/components/list-group/list-group-styleguide';
import { AppJolticonsStyleguide } from '../../../lib/gj-lib-client/components/jolticons/jolticons-styleguide';
import { AppProgressBarStyleguide } from '../../../lib/gj-lib-client/components/progress/bar/bar-styleguide';

@View
@Component({
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
export default class RouteStyleguide extends Vue {
	@RouteResolve()
	routeResolve() {
		return User.touch();
	}

	routeInit() {
		Meta.title = 'Styleguide';
	}
}
