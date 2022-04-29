<script lang="ts">
import { defineAsyncComponent } from '@vue/runtime-core';
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { BaseRouteComponent, OptionsForRoute } from '../../../../../_common/route/route-component';
import AppScrollAffix from '../../../../../_common/scroll/AppScrollAffix.vue';
import { vAppScrollTo } from '../../../../../_common/scroll/to/to.directive';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { User } from '../../../../../_common/user/user.model';
import FormSettings from '../../../../components/forms/settings/settings.vue';
import AppPageHeader from '../../../../components/page-header/page-header.vue';
import { useAccountRouteController } from '../account.vue';

@Options({
	name: 'RouteDashAccountDeviceSettings',
	components: {
		AppPageHeader,
		AppScrollAffix,
		FormSettings,
		FormSettingsDev: defineAsyncComponent(
			() => import('../../../../components/forms/settings/dev.vue')
		),
	},
	directives: {
		AppScrollTo: vAppScrollTo,
	},
})
@OptionsForRoute({
	deps: {},
	resolver: () => User.touch(),
})
export default class RouteDashAccountDeviceSettings extends BaseRouteComponent {
	routeStore = setup(() => useAccountRouteController()!);
	commonStore = setup(() => useCommonStore());

	routeCreated() {
		this.routeStore.heading = this.$gettext(`Device Settings`);
	}

	get user() {
		return this.commonStore.user;
	}

	get hasDev() {
		return this.user?.isMod;
	}

	get sections() {
		const sections: any = {};

		if (GJ_IS_DESKTOP_APP) {
			sections.client = this.$gettext('Client');
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
		return this.$gettext('Device Settings');
	}
}
</script>

<template>
	<div class="row">
		<div class="col-md-9 col-lg-8">
			<FormSettings />

			<template v-if="hasDev">
				<hr class="fieldset-divider" />

				<FormSettingsDev />
			</template>
		</div>
	</div>
</template>
