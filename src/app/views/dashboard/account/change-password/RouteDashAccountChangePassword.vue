<script lang="ts">
import { computed, ref } from 'vue';
import { Api } from '../../../../../_common/api/api.service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { $gettext } from '../../../../../_common/translate/translate.service';
import FormChangePassword from '../../../../components/forms/change-password/change-password.vue';
import { useAccountRouteController } from '../RouteDashAccount.vue';
export default {
	...defineAppRouteOptions({
		deps: {},
		resolver: () => Api.sendRequest('/web/dash/account/has-password'),
	}),
};
</script>

<script lang="ts" setup>
const routeStore = useAccountRouteController()!;

const hasPassword = ref(true);

createAppRoute({
	routeTitle: computed(() => routeStore.heading.value),
	onInit() {
		routeStore.heading.value = $gettext(`Change Password`);
	},
	onResolved({ payload }) {
		hasPassword.value = payload.hasPassword;
	},
});
</script>

<template>
	<div class="row">
		<div class="col-md-9 col-lg-8">
			<!--TODO(component-setup-refactor-routes-1): Seems like this error will be gone
				when we convert the FormChangePassword?-->
			<FormChangePassword :requires-old="hasPassword" @submit="hasPassword = true" />
		</div>
	</div>
</template>
