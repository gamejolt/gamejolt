<script lang="ts">
import { ref } from 'vue';
import { Api } from '../../../../../_common/api/api.service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { UserModel } from '../../../../../_common/user/user.model';
import FormEmailPreferences from '../../../../components/forms/email-preferences/FormEmailPreferences.vue';
import { IntentService } from '../../../../components/intent/intent.service';
import { useAccountRouteController } from '../RouteDashAccount.vue';

export default {
	...defineAppRouteOptions({
		deps: { query: ['intent'] },
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
