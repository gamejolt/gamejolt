<script lang="ts">
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { authOnLogin, redirectToOnboarding } from '../../../../_common/auth/auth.service';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import { AppProgressPoller } from '../../../../_common/progress/poller/poller';
import { BaseRouteComponent, OptionsForRoute } from '../../../../_common/route/route-component';

@Options({
	name: 'RouteJoinAlmost',
	components: {
		AppProgressPoller,
		AppLoading,
	},
})
@OptionsForRoute()
export default class RouteJoinAlmost extends BaseRouteComponent {
	username: string | null = null;
	password: string | null = null;

	get routeTitle() {
		return this.$gettext('Almost there!');
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
				<AppTranslate>Almost there, human!</AppTranslate>
				<br />
				(ヽ° - °)ヽ┳━┳
			</template>
			<template v-else>
				<AppTranslate>Almost there!</AppTranslate>
			</template>
		</h2>

		<p>
			<AppTranslate>
				Before you can log in to Game Jolt, you need to verify the email address on your
				account.
			</AppTranslate>
		</p>
		<p>
			<AppTranslate>
				We've sent you an email with instructions on how to authorize your account.
			</AppTranslate>
		</p>
		<p class="small text-muted">
			<AppTranslate>
				If you don't see an email within 10 minutes, please check your spam folder. It might
				have gobbled it up.
			</AppTranslate>
		</p>
		<p class="small text-muted">
			<AppTranslate>
				Note that you have a week to authorize your account. After that, it will be deleted
				and you'll have to sign up again.
			</AppTranslate>
		</p>

		<!--
			We poll to see if their account gets authorized or not.
			When it does, we can log them in.
		-->
		<AppProgressPoller
			v-if="isGamejoltSignup"
			:url="`/web/auth/poll-authorized/${username}`"
			@complete="onAuthorized"
		/>
	</div>
</template>
