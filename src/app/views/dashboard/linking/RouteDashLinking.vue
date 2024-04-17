<script lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Client } from '../../../../_common/client/safe-exports';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import AppProgressPoller from '../../../../_common/progress/poller/AppProgressPoller.vue';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { $gettext } from '../../../../_common/translate/translate.service';

export default {
	...defineAppRouteOptions({
		deps: null,
	}),
};
</script>

<script lang="ts" setup>
const route = useRoute();
const router = useRouter();

const token = ref('');

function completed(response: any) {
	const routeName = 'dash.account.linked-accounts.link-callback';

	const routeParams: { [k: string]: string } =
		response.resource === 'Game' ? { id: response['resource-id'] } : {};

	// Redirect them off to complete their social login like normal.
	router.push({
		name: routeName,
		params: { ...routeParams, provider: response.provider },
		query: {
			code: response.code,
			state: token.value,
			channelTitle: response.channel ? response.channel.title : null,
		},
	});

	// Focus back to the Client.
	Client?.show();
}

function failed() {
	showErrorGrowl({
		message: $gettext('Could not link.'),
		title: $gettext('Link Failed'),
		sticky: true,
	});

	// Focus back to the Client.
	Client?.show();
}

createAppRoute({
	routeTitle: computed(() => $gettext('Waiting for Link')),
	onInit() {
		token.value = route.query.token as string;
	},
});
</script>

<template>
	<section class="section">
		<div class="container">
			<div v-if="token">
				<p>
					{{ $gettext(`Please use your web browser to complete the process.`) }}
				</p>

				<AppProgressPoller
					:url="`/web/auth/poll-oauth/${token}`"
					:interval="2500"
					@complete="completed"
					@error="failed"
				/>

				<AppLoading :label="$gettext('Linking...')" />
			</div>
		</div>
	</section>
</template>
