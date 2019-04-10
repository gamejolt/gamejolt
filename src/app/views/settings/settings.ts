import { BaseRouteComponent, RouteResolver } from 'game-jolt-frontend-lib/components/route/route-component';
import AppScrollAffix from 'game-jolt-frontend-lib/components/scroll/affix/affix.vue';
import { AppScrollTo } from 'game-jolt-frontend-lib/components/scroll/to/to.directive';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import { Component } from 'vue-property-decorator';
import FormSettings from '../../components/forms/settings/settings.vue';
import AppPageHeader from '../../components/page-header/page-header.vue';

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
@RouteResolver({
	deps: {},
	resolver: () => User.touch(),
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

	get routeTitle() {
		return this.$gettext('Settings');
	}
}
