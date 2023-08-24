<script lang="ts">
import { computed, ref } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import { authOnJoin, redirectToOnboarding } from '../../../../_common/auth/auth.service';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import AppProgressPoller from '../../../../_common/progress/poller/AppProgressPoller.vue';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { $gettext } from '../../../../_common/translate/translate.service';

export default {
	...defineAppRouteOptions({}),
};
</script>

<script lang="ts" setup>
const username = ref<string | null>(null);
const password = ref<string | null>(null);

const isGamejoltSignup = computed(() => username.value || password.value);

createAppRoute({
	routeTitle: $gettext('Almost there!'),
	onInit: () => {
		username.value = sessionStorage.getItem('signup-username');
		password.value = sessionStorage.getItem('signup-password');
	},
});

async function onAuthorized() {
	if (!isGamejoltSignup.value) {
		return;
	}

	// Now that they're authorized, we try to log them in with the credentials they used to sign up.
	const response = await Api.sendRequest('/web/auth/login', {
		username: username.value,
		password: password.value,
	});

	sessionStorage.removeItem('signup-username');
	sessionStorage.removeItem('signup-password');

	if (!response.success || !response.user) {
		showErrorGrowl({
			message: $gettext(`Couldn't log you in for some reason.`),
			sticky: true,
		});
		return;
	}

	// If it worked, redirect to onboarding flow. They're good to go!
	authOnJoin('email');
	redirectToOnboarding();
}
</script>

<template>
	<div class="anim-fade-in-up">
		<h2 class="section-header">
			<!-- signups with gamejolt required a captcha to be solved. lets congratulate them \o/ -->
			<template v-if="isGamejoltSignup">
				{{ $gettext(`Almost there, human!`) }}
				<br />
				(ヽ° - °)ヽ┳━┳
			</template>
			<template v-else>
				{{ $gettext(`Almost there!`) }}
			</template>
		</h2>

		<p>
			{{
				$gettext(
					`Before you can log in to Game Jolt, you need to verify the email address on your account.`
				)
			}}
		</p>
		<p>
			{{
				$gettext(
					`We've sent you an email with instructions on how to authorize your account.`
				)
			}}
		</p>
		<p class="small text-muted">
			{{
				$gettext(
					`If you don't see an email within 10 minutes, please check your spam folder. It might have gobbled it up.`
				)
			}}
		</p>
		<p class="small text-muted">
			{{
				$gettext(
					`Note that you have a week to authorize your account. After that, it will be deleted and you'll have to sign up again.`
				)
			}}
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
