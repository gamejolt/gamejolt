<script lang="ts">
import { defineAppRouteOptions } from '../../../../_common/route/route-component';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import { $gettext } from '../../../../_common/translate/translate.service';
import { locationRedirectFromRoute } from '../../../../utils/router';
import { loggedUserBlock } from '../RouteAuth.vue';

export default {
	name: 'RouteAuthLogin',
	...defineAppRouteOptions({
		reloadOn: { query: ['intent'] },
		async resolver({ route }) {
			if (route.query.intent === 'approve-login-expired') {
				showErrorGrowl({
					sticky: true,
					message: $gettext('This login attempt has expired. Try again.'),
				});
				return locationRedirectFromRoute(route, {}, { intent: undefined });
			}

			return loggedUserBlock();
		},
	}),
};
</script>

<script lang="ts" setup>
import { useRoute } from 'vue-router';
import AppAuthLogin from '../../../../_common/auth/login/AppAuthLogin.vue';
import { createAppRoute } from '../../../../_common/route/route-component';
import { $gettext } from '../../../../_common/translate/translate.service';

const route = useRoute();

const redirect = route.query.redirect as string || '';

createAppRoute({
	routeTitle: $gettext('Log in to Game Jolt'),
});
</script>

<template>
	<div>
		<AppAuthLogin overlay :redirect-to="redirect" />

		<div class="auth-page-links text-right anim-fade-in">
			<div class="auth-page-link">
				<router-link :to="{ name: 'auth.forgot' }">
					<AppTranslate>Having trouble logging in?</AppTranslate>
				</router-link>
			</div>
			<div class="auth-page-link">
				Don't have an account?
				<router-link :to="{ name: 'auth.join' }">
					<AppTranslate>Sign up!</AppTranslate>
				</router-link>
			</div>
		</div>
	</div>
</template>
