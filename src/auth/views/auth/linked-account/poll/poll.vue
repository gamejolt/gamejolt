<script lang="ts">
import { Options } from 'vue-property-decorator';
import { Client } from '../../../../../_common/client/safe-exports';
import { showErrorGrowl } from '../../../../../_common/growls/growls.service';
import AppLoading from '../../../../../_common/loading/AppLoading.vue';
import { AppProgressPoller } from '../../../../../_common/progress/poller/poller';
import { BaseRouteComponent, OptionsForRoute } from '../../../../../_common/route/route-component';

@Options({
	name: 'RouteAuthLinkedAccountPoll',
	components: {
		AppProgressPoller,
		AppLoading,
	},
})
@OptionsForRoute()
export default class RouteAuthLinkedAccountPoll extends BaseRouteComponent {
	token = '';
	isPolling = true;

	get routeTitle() {
		return this.$gettext(`Waiting for Login`);
	}

	routeCreated() {
		this.token = this.$route.params.token;
	}

	completed(response: any) {
		// Redirect them off to complete their social login like normal.

		const validProviders = ['facebook', 'twitch', 'twitter', 'google'];
		const provider = response.provider;
		if (validProviders.indexOf(provider) !== -1) {
			this.$router.push({
				name: `auth.linked-account.${provider}.callback`,
				query: { code: response.code, state: this.token },
			});
		}

		this.isPolling = false;

		// Focus back to the Client.
		Client?.show();
	}

	failed() {
		showErrorGrowl(this.$gettext(`Couldn't authorize.`), this.$gettext(`Authorization Failed`));
		this.$router.push({ name: 'auth.login' });
	}
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
