<script lang="ts">
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
</script>

<template>
	<div>
		<app-page-header>
			<div class="row">
				<div class="col-sm-9 col-sm-offset-3 col-md-8 col-md-offset-2 col-lg-6">
					<h1>
						<translate>settings.heading</translate>
					</h1>
				</div>
			</div>
		</app-page-header>

		<section class="section">
			<div class="container">
				<div class="row">
					<div class="col-sm-3 col-md-2 hidden-xs">
						<app-scroll-affix>
							<nav class="platform-list">
								<ul>
									<li v-for="(label, section) of sections" :key="section">
										<a v-app-scroll-to="`settings-${section}`">
											{{ label }}
										</a>
									</li>
								</ul>
							</nav>
						</app-scroll-affix>
					</div>
					<div class="col-sm-9 col-md-8 col-lg-6">
						<form-settings />

						<template v-if="hasDev">
							<form-settings-dev />
						</template>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>
