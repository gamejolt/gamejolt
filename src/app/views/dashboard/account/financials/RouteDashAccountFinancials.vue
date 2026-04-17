<script lang="ts">
import { computed } from 'vue';
import { RouterView } from 'vue-router';

import { routeDashAccountFinancialsCreators } from '~app/views/dashboard/account/financials/creators/creators.route';
import { routeDashAccountFinancialsMarketplace } from '~app/views/dashboard/account/financials/marketplace/marketplace.route';
import { useAccountRouteController } from '~app/views/dashboard/account/RouteDashAccount.vue';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import AppSheetButton from '~common/sheet/AppSheetButton.vue';
import { $gettext } from '~common/translate/translate.service';

export default {
	...defineAppRouteOptions({
		reloadOn: 'never',
	}),
};
</script>

<script lang="ts" setup>
const { heading } = useAccountRouteController()!;

const routeTitle = computed(() => $gettext(`Marketplace account setup`));

createAppRoute({
	routeTitle,
	onInit() {
		heading.value = routeTitle.value;
	},
});
</script>

<template>
	<div class="row">
		<div class="col-md-9 col-lg-8">
			<RouterView v-slot="{ Component }">
				<!-- If they haven't navigated to a sub-route yet, we show the menu -->
				<template v-if="!Component">
					<div class="row">
						<div class="col-sm-6">
							<AppSheetButton
								:to="{ name: routeDashAccountFinancialsCreators.name }"
								icon="gem"
							>
								{{ $gettext(`Creator setup`) }}
							</AppSheetButton>
						</div>

						<div class="col-sm-6">
							<AppSheetButton
								:to="{ name: routeDashAccountFinancialsMarketplace.name }"
								icon="marketplace"
							>
								{{ $gettext(`Developer marketplace setup`) }}
							</AppSheetButton>
						</div>
					</div>
				</template>
				<template v-else>
					<component :is="Component" />
				</template>
			</RouterView>
		</div>
	</div>
</template>
