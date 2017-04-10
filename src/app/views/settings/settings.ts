import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./settings.html';

import { Meta } from '../../../lib/gj-lib-client/components/meta/meta-service';
import { Environment } from '../../../lib/gj-lib-client/components/environment/environment.service';
import { AppScrollAffix } from '../../../lib/gj-lib-client/components/scroll/affix/affix';
import { AppPageHeader } from '../../components/page-header/page-header';
import { BeforeRouteEnter } from '../../../lib/gj-lib-client/utils/router';
import { User } from '../../../lib/gj-lib-client/components/user/user.model';
import { FormSettings } from '../../components/forms/settings/settings';
import { AppScrollTo } from '../../../lib/gj-lib-client/components/scroll/to/to.directive';

@View
@Component({
	components: {
		AppPageHeader,
		AppScrollAffix,
		FormSettings,
	},
	directives: {
		AppScrollTo,
	},
})
export default class RouteSettings extends Vue
{
	Environment = Environment;

	get sections()
	{
		const sections: any = {};

		if ( Environment.isClient ) {
			sections.client = this.$gettext( 'settings.client' );
		}

		return {
			chat: this.$gettext( 'settings.chat' ),
			restrictions: this.$gettext( 'Restrictions' ),
			notifications: this.$gettext( 'Notifications' ),
		};
	}

	@BeforeRouteEnter()
	routeEnter()
	{
		User.touch();
		return Promise.resolve();
	}

	created()
	{
		Meta.title = this.$gettext( 'Settings' );
	}
}
