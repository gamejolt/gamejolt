<script lang="ts">
import { ref } from 'vue';

import FormEmailPreferences from '~app/components/forms/email-preferences/FormEmailPreferences.vue';
import { IntentService } from '~app/components/intent/intent.service';
import { useAccountRouteController } from '~app/views/dashboard/account/RouteDashAccount.vue';
import { Api } from '~common/api/api.service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '~common/route/route-component';
import { $gettext } from '~common/translate/translate.service';
import { UserModel } from '~common/user/user.model';

export default {
	...defineAppRouteOptions({
		reloadOn: { query: ['intent'] },
		async resolver({ route }) {
			const intentRedirect = IntentService.checkRoute(route, {
				intent: 'unsubscribe',
				message: $gettext(`We have updated your email preferences.`),
			});
			if (intentRedirect) {
				return intentRedirect;
			}

			return Api.sendRequest('/web/dash/email-preferences');
		},
	}),
};
</script>

<script lang="ts" setup>
const { heading } = useAccountRouteController()!;
const user = ref<UserModel>(null as any);

const { isBootstrapped } = createAppRoute({
	routeTitle: heading,
	onInit() {
		heading.value = $gettext(`Email Preferences`);
	},
	onResolved({ payload }) {
		user.value = new UserModel(payload.user);
	},
});
</script>

<template>
	<div v-if="isBootstrapped" class="row">
		<div class="col-md-9 col-lg-8">
			<FormEmailPreferences :user="user" />
		</div>
	</div>
</template>
