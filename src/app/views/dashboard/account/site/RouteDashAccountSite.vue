<script lang="ts">
import { ref } from 'vue';

import AppSitesLinkCard from '~app/components/sites/link-card/AppSitesLinkCard.vue';
import AppSitesManagePage from '~app/components/sites/manage-page/AppSitesManagePage.vue';
import { useAccountRouteController } from '~app/views/dashboard/account/RouteDashAccount.vue';
import { Api } from '~common/api/api.service';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import { SiteModel } from '~common/site/site-model';
import { $gettext } from '~common/translate/translate.service';
export default {
	...defineAppRouteOptions({
		reloadOn: 'never',
		resolver: () => Api.sendRequest('/web/dash/sites'),
	}),
};
</script>

<script lang="ts" setup>
const { heading } = useAccountRouteController()!;

const site = ref<SiteModel>(null as any);

const { isBootstrapped } = createAppRoute({
	routeTitle: heading,
	onInit() {
		heading.value = $gettext(`Manage Portfolio Site`);
	},
	onResolved({ payload }) {
		site.value = new SiteModel(payload.site);
	},
});
</script>

<template>
	<div v-if="isBootstrapped" class="row">
		<div class="col-md-9 col-lg-8">
			<AppSitesManagePage :site="site" />
		</div>
		<div class="col-md-3 col-lg-4">
			<br class="hidden-lg" />

			<p class="page-help">
				<strong>
					{{
						$gettext(
							`Game Jolt Sites are customizable external sites for your portfolio and games!`
						)
					}}
				</strong>
				{{ ' ' }}
				{{
					$gettext(
						`You can use a customizable template, or simply upload your own static site.`
					)
				}}
			</p>

			<p class="page-help">
				{{
					$gettext(
						`Sites don't replace your Game Jolt user profile page. You can use your Site URL to share your site with others.`
					)
				}}
			</p>

			<p class="page-help">
				{{ $gettext(`You can set up a game site when managing your game.`) }}
			</p>

			<hr />

			<AppSitesLinkCard :site="site" />
		</div>
	</div>
</template>
