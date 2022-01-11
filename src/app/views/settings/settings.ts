import { defineAsyncComponent } from '@vue/runtime-core';
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import AppScrollAffix from '../../../_common/scroll/affix/affix.vue';
import { AppScrollTo } from '../../../_common/scroll/to/to.directive';
import { useCommonStore } from '../../../_common/store/common-store';
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
			() => import('../../components/forms/settings/dev.vue')
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
	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}

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
