<script lang="ts">
import { defineAppRouteOptions } from '../../../../_common/route/route-component';
import { Api } from '../../../../_common/api/api.service';

export default {
	name: 'RouteAuthResetPassword',
	...defineAppRouteOptions({
		reloadOn: 'always',
		// Will return a 404 if the key isn't correct for this user.
		resolver: ({ route }) =>
			Api.sendRequest('/web/auth/check-reset-key/' + route.params.userId, {
				key: route.params.token,
			}),
	}),
};
</script>

<script lang="ts" setup>
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showSuccessGrowl } from '../../../../_common/growls/growls.service';
import { createAppRoute } from '../../../../_common/route/route-component';
import { $gettext } from '../../../../_common/translate/translate.service';
import FormResetPassword from '../../../components/forms/reset-password/FormResetPassword.vue';

const route = useRoute();
const router = useRouter();

const userId = computed(() => parseInt(route.params.userId as string, 10));
const token = computed(() => route.params.token as string);

createAppRoute({
	routeTitle: $gettext('Reset Password'),
});

function onSubmitted() {
	showSuccessGrowl(
		$gettext('Your password has been reset. Now you can log in with your new one.'),
		$gettext('Password Changed')
	);
	router.push({ name: 'auth.login' });
}
</script>

<template>
	<div>
		<h2 class="section-header anim-fade-in-enlarge">
			<AppTranslate>Reset Password</AppTranslate>
		</h2>

		<FormResetPassword :user-id="userId" :token="token" @submit="onSubmitted" />
	</div>
</template>
