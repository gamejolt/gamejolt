import { Component } from 'vue-property-decorator';
import * as View from '!view!./settings.html';

import { AppScrollAffix } from '../../../lib/gj-lib-client/components/scroll/affix/affix';
import { AppPageHeader } from '../../components/page-header/page-header';
import { User } from '../../../lib/gj-lib-client/components/user/user.model';
import { FormSettings } from '../../components/forms/settings/settings';
import { AppScrollTo } from '../../../lib/gj-lib-client/components/scroll/to/to.directive';
import { Api } from '../../../lib/gj-lib-client/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../lib/gj-lib-client/components/route/route-component';

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
	user?: User;

	get sections() {
		const sections: any = {};

		if (GJ_IS_CLIENT) {
			sections.client = this.$gettext('settings.client');
		}

		return {
			site: this.$gettext('Site'),
			chat: this.$gettext('settings.chat'),
			restrictions: this.$gettext('Restrictions'),
			notifications: this.$gettext('Notifications'),
		};
	}

	@RouteResolve()
	routeResolve() {
		return Api.sendRequest('/web/dash/settings');
	}

	routed() {
		console.log(this.$payload);
		this.user = this.$payload.user;
	}

	get routeTitle() {
		return this.$gettext('Settings');
	}
}
