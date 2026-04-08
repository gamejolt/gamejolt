<script lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Client } from '../../../../../_common/client/safe-exports';
import { showErrorGrowl } from '../../../../../_common/growls/growls.service';
import AppLoading from '../../../../../_common/loading/AppLoading.vue';
import AppProgressPoller from '../../../../../_common/progress/poller/AppProgressPoller.vue';
import { defineAppRouteOptions } from '../../../../../_common/route/route-component';
import { createAppRoute } from '../../../../../_common/route/route-component';
import { $gettext } from '../../../../../_common/translate/translate.service';

export default {
	name: 'RouteAuthLinkedAccountPoll',
	...defineAppRouteOptions({
		reloadOn: 'always',
	}),
};
</script>

<script lang="ts" setup>
const route = useRoute();
const router = useRouter();

const token = ref('');
const isPolling = ref(true);

createAppRoute({
	routeTitle: $gettext('Waiting for Login'),
	onInit() {
		token.value = route.params.token as string;
	},
});

function completed(response: any) {
	const validProviders = ['facebook', 'twitch', 'google'];
	const provider = response.provider;
	if (validProviders.indexOf(provider) !== -1) {
		router.push({
			name: `auth.linked-account.${provider}.callback`,
			query: { code: response.code, state: token.value },
		});
	}

	isPolling.value = false;

	// Focus back to the Client.
	Client?.show();
}

function failed() {
	showErrorGrowl($gettext(`Couldn't authorize.`), $gettext(`Authorization Failed`));
	router.push({ name: 'auth.login' });
}
</script>

<template>
	<div v-if="token">
		<template v-if="isPolling">
			<p>Please login to your account through your web browser.</p>

			<AppProgressPoller
				:url="`/web/auth/poll-oauth/${token}`"
				:interval="2500"
				@complete="completed"
				@error="failed"
			/>
		</template>
		<template v-else>
			<AppLoading
				:label="$gettext('Processing. Please wait...')"
				:centered="true"
				:big="true"
			/>
		</template>
	</div>
</template>
