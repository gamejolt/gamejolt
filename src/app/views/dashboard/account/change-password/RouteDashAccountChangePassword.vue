<script lang="ts">
import { ref } from 'vue';
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
		reloadOn: 'never',
		resolver: () => Api.sendRequest('/web/dash/account/has-password'),
	}),
};
</script>

<script lang="ts" setup>
const { heading } = useAccountRouteController()!;

const hasPassword = ref(true);

createAppRoute({
	routeTitle: heading,
	onInit() {
		heading.value = $gettext(`Change Password`);
	},
	onResolved({ payload }) {
		hasPassword.value = payload.hasPassword;
	},
});
</script>

<template>
	<div class="row">
		<div class="col-md-9 col-lg-8">
			<FormChangePassword :requires-old="hasPassword" @submit="hasPassword = true" />
		</div>
	</div>
</template>
