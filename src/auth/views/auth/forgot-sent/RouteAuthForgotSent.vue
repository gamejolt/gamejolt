<script lang="ts">
import { defineAppRouteOptions } from '~common/route/route-component';
import { createAppRoute } from '~common/route/route-component';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';

export default {
	name: 'RouteAuthForgotSent',
	...defineAppRouteOptions({
		reloadOn: 'never',
	}),
};
</script>

<script lang="ts" setup>
createAppRoute({
	routeTitle: $gettext('Credentials Sent'),
});
</script>

<template>
	<div class="anim-fade-in-up">
		<h2 class="section-header">
			<AppTranslate>Credentials Sent</AppTranslate>
		</h2>

		<p>
			<AppTranslate>
				We've sent information on how to log in to the email address on your account.
			</AppTranslate>
		</p>

		<p class="small text-muted">
			<AppTranslate>
				If you don't see our email within 10 minutes, please check your spam folder. It
				might have been gobbled up!
			</AppTranslate>
		</p>
	</div>
</template>
