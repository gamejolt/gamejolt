<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../_common/route/legacy-route-component';
import { SiteModel } from '../../../../../_common/site/site-model';
import { $gettext } from '../../../../../_common/translate/translate.service';
import AppSitesLinkCard from '../../../../components/sites/link-card/link-card.vue';
import AppSitesManagePage from '../../../../components/sites/manage-page/manage-page.vue';
import { useAccountRouteController } from '../RouteDashAccount.vue';

@Options({
	name: 'RouteDashAccountSite',
	components: {
		AppSitesManagePage,
		AppSitesLinkCard,
	},
})
@OptionsForLegacyRoute({
	deps: {},
	resolver: () => Api.sendRequest('/web/dash/sites'),
})
export default class RouteDashAccountSite extends LegacyRouteComponent {
	routeStore = setup(() => useAccountRouteController()!);

	site?: SiteModel = null as any;

	get routeTitle() {
		return this.routeStore.heading;
	}

	routeCreated() {
		this.routeStore.heading = $gettext(`Manage Portfolio Site`);
	}

	routeResolved($payload: any) {
		this.site = new SiteModel($payload.site);
	}
}
</script>

<template>
	<div v-if="isRouteBootstrapped" class="row">
		<div class="col-md-9 col-lg-8">
			<AppSitesManagePage :site="site" />
		</div>
		<div class="col-md-3 col-lg-4">
			<br class="hidden-lg" />

			<p class="page-help">
				<strong>
					<AppTranslate>
						Game Jolt Sites are customizable external sites for your portfolio and
						games!
					</AppTranslate>
				</strong>
				{{ ' ' }}
				<AppTranslate>
					You can use a customizable template, or simply upload your own static site.
				</AppTranslate>
			</p>

			<p class="page-help">
				<AppTranslate>
					Sites don't replace your Game Jolt user profile page. You can use your Site URL
					to share your site with others.
				</AppTranslate>
			</p>

			<p class="page-help">
				<AppTranslate>You can set up a game site when managing your game.</AppTranslate>
			</p>

			<hr />

			<AppSitesLinkCard :site="site" />
		</div>
	</div>
</template>
