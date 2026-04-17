<script lang="ts">
import { computed, defineAsyncComponent } from 'vue';

import FormSettings from '~app/components/forms/settings/FormSettings.vue';
import { useAccountRouteController } from '~app/views/dashboard/account/RouteDashAccount.vue';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import { useCommonStore } from '~common/store/common-store';
import { $gettext } from '~common/translate/translate.service';
import { touchUser } from '~common/user/user.model';

const FormSettingsDev = defineAsyncComponent(
	() => import('~app/components/forms/settings/FormSettingsDev.vue')
);

export default {
	...defineAppRouteOptions({
		reloadOn: 'never',
		resolver: () => touchUser(),
	}),
};
</script>

<script lang="ts" setup>
const { heading } = useAccountRouteController()!;
const { user } = useCommonStore();

const routeTitle = computed(() => $gettext(`Device Settings`));
const hasDev = computed(
	() => user.value?.isMod || GJ_BUILD_TYPE === 'serve-hmr' || GJ_BUILD_TYPE === 'serve-build'
);

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
			<FormSettings />

			<template v-if="hasDev">
				<hr class="fieldset-divider" />

				<FormSettingsDev />
			</template>
		</div>
	</div>
</template>
