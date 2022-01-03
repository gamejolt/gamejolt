import { defineAsyncComponent } from '@vue/runtime-core';
import { Options } from 'vue-property-decorator';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import AppScrollAffix from '../../../_common/scroll/affix/affix.vue';
import { AppScrollTo } from '../../../_common/scroll/to/to.directive';
import { AppState, AppStore } from '../../../_common/store/app-store';
import { User } from '../../../_common/user/user.model';
import FormSettings from '../../components/forms/settings/settings.vue';
import AppPageHeader from '../../components/page-header/page-header.vue';

@Options({
	name: 'RouteSettings',
	components: {
		AppPageHeader,
		AppScrollAffix,
		FormSettings,
		FormSettingsDev: defineAsyncComponent(
			() =>
				import(
					/* webpackChunkName: "FormSettingsDev" */ '../../components/forms/settings/dev.vue'
				)
		),
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
	@AppState user!: AppStore['user'];

	get hasDev() {
		return this.user?.isMod;
	}

	get sections() {
		const sections: any = {};

		if (GJ_IS_DESKTOP_APP) {
			sections.client = this.$gettext('settings.client');
		}

		Object.assign(sections, {
			site: this.$gettext('Site'),
			restrictions: this.$gettext('Restrictions'),
			notifications: this.$gettext('Notifications'),
		});

		if (this.hasDev) {
			sections.dev = 'Dev';
		}

		return sections;
	}

	get routeTitle() {
		return this.$gettext('Settings');
	}
}
