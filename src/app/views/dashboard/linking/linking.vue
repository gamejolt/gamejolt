<script lang="ts">
import { Options } from 'vue-property-decorator';
import { Client } from '../../../../_common/client/safe-exports';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import { AppProgressPoller } from '../../../../_common/progress/poller/poller';
import { BaseRouteComponent, OptionsForRoute } from '../../../../_common/route/route-component';

@Options({
	name: 'RouteDashLinking',
	components: {
		AppProgressPoller,
		AppLoading,
	},
})
@OptionsForRoute()
export default class RouteDashLinking extends BaseRouteComponent {
	token!: string;

	get routeTitle() {
		return this.$gettext('Waiting for Link');
	}

	routeCreated() {
		this.token = this.$route.query.token as string;
	}

	completed(response: any) {
		const routeName = 'dash.account.linked-accounts.link-callback';

		const routeParams: { [k: string]: string } =
			response.resource === 'Game' ? { id: response['resource-id'] } : {};

		// Redirect them off to complete their social login like normal.
		this.$router.push({
			name: routeName,
			params: { ...routeParams, provider: response.provider },
			query: {
				code: response.code,
				state: this.token,
				channelTitle: response.channel ? response.channel.title : null,
			},
		});

		// Focus back to the Client.
		Client?.show();
	}

	failed() {
		showErrorGrowl({
			message: this.$gettext('Could not link.'),
			title: this.$gettext('Link Failed'),
			sticky: true,
		});

		// Focus back to the Client.
		Client?.show();
	}
}
</script>

<template>
	<section class="section">
		<div class="container">
			<div v-if="token">
				<p>
					<AppTranslate>
						Please use your web browser to complete the process.
					</AppTranslate>
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
