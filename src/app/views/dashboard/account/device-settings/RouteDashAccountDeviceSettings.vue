<script lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { User } from '../../../../../_common/user/user.model';
import FormSettings from '../../../../components/forms/settings/FormSettings.vue';
import { useAccountRouteController } from '../account.vue';

const FormSettingsDev = defineAsyncComponent(
	() => import('../../../../components/forms/settings/FormSettingsDev.vue')
);

export default {
	...defineAppRouteOptions({
		deps: {},
		resolver: () => User.touch(),
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
