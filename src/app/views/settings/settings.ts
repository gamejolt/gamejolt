import View from '!view!./settings.html';
import { Component } from 'vue-property-decorator';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../lib/gj-lib-client/components/route/route-component';
import { AppScrollAffix } from '../../../lib/gj-lib-client/components/scroll/affix/affix';
import { AppScrollTo } from '../../../lib/gj-lib-client/components/scroll/to/to.directive';
import { User } from '../../../lib/gj-lib-client/components/user/user.model';
import { FormSettings } from '../../components/forms/settings/settings';
import { AppPageHeader } from '../../components/page-header/page-header';

@View
@Component({
	name: 'RouteSettings',
	components: {
		AppPageHeader,
		AppScrollAffix,
		FormSettings,
	},
	directives: {
		AppScrollTo,
	},
})
export default class RouteSettings extends BaseRouteComponent {
	get sections() {
		const sections: any = {};

		if (GJ_IS_CLIENT) {
			sections.client = this.$gettext('settings.client');
		}

		Object.assign(sections, {
			site: this.$gettext('Site'),
			restrictions: this.$gettext('Restrictions'),
			notifications: this.$gettext('Notifications'),
		});

		return sections;
	}

	@RouteResolve({
		deps: {},
	})
	async routeResolve() {
		User.touch();
	}

	get routeTitle() {
		return this.$gettext('Settings');
	}
}
