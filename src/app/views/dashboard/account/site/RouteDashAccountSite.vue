<script lang="ts">
import { ref } from 'vue';
import { Api } from '../../../../../_common/api/api.service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { SiteModel } from '../../../../../_common/site/site-model';
import { $gettext } from '../../../../../_common/translate/translate.service';
import AppSitesLinkCard from '../../../../components/sites/link-card/link-card.vue';
import AppSitesManagePage from '../../../../components/sites/manage-page/manage-page.vue';
import { useAccountRouteController } from '../RouteDashAccount.vue';
export default {
	...defineAppRouteOptions({
		deps: {},
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
