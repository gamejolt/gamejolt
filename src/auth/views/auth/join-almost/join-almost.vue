<script lang="ts">
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { authOnLogin, redirectToOnboarding } from '../../../../_common/auth/auth.service';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import AppLoading from '../../../../_common/loading/loading.vue';
import { AppProgressPoller } from '../../../../_common/progress/poller/poller';
import { BaseRouteComponent } from '../../../../_common/route/route-component';

@Options({
	name: 'RouteJoinAlmost',
	components: {
		AppProgressPoller,
		AppLoading,
	},
})
export default class RouteJoinAlmost extends BaseRouteComponent {
	username: string | null = null;
	password: string | null = null;

	get routeTitle() {
		return this.$gettext('auth.join.almost.page_title');
	}

	get isGamejoltSignup() {
		return this.username || this.password;
	}

	routeCreated() {
		this.username = sessionStorage.getItem('signup-username');
		this.password = sessionStorage.getItem('signup-password');
	}

	async onAuthorized() {
		if (!this.isGamejoltSignup) {
			return;
		}

		// Now that they're authorized, we try to log them in with the credentials they used to sign up.
		const response = await Api.sendRequest('/web/auth/login', {
			username: this.username,
			password: this.password,
		});

		sessionStorage.removeItem('signup-username');
		sessionStorage.removeItem('signup-password');

		if (!response.success || !response.user) {
			showErrorGrowl({
				message: this.$gettext(`Couldn't log you in for some reason.`),
				sticky: true,
			});
			return;
		}

		// If it worked, redirect to onbaording flow. They're good to go!
		authOnLogin('email');
		redirectToOnboarding();
	}
}
</script>

<template>
	<div class="anim-fade-in-up">
		<h2 class="section-header">
			<!-- signups with gamejolt required a captcha to be solved. lets congratulate them \o/ -->
			<template v-if="isGamejoltSignup">
				<translate>Almost there, human!</translate>
				<br />
				(ヽ° - °)ヽ┳━┳
			</template>
			<template v-else>
				<translate>Almost there!</translate>
			</template>
		</h2>

		<p>
			<translate>
				Before you can log in to Game Jolt, you need to verify the email address on your account.
			</translate>
		</p>
		<p>
			<translate>
				We've sent you an email with instructions on how to authorize your account.
			</translate>
		</p>
		<p class="small text-muted">
			<translate>auth.join.almost.spam</translate>
		</p>
		<p class="small text-muted">
			<translate>auth.join.almost.urgency</translate>
		</p>

		<!--
		We poll to see if their account gets authorized or not.
		When it does, we can log them in.
	-->
		<app-progress-poller
			v-if="isGamejoltSignup"
			:url="`/web/auth/poll-authorized/${username}`"
			@complete="onAuthorized"
		/>
	</div>
</template>
