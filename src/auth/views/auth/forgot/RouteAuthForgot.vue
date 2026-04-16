<script lang="ts">
import { useRouter } from 'vue-router';

import FormRetrieveLogin from '~auth/components/forms/retrieve-login/FormRetrieveLogin.vue';
import { defineAppRouteOptions } from '~common/route/route-component';
import { createAppRoute } from '~common/route/route-component';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';

export default {
	name: 'RouteAuthForgot',
	...defineAppRouteOptions({
		reloadOn: 'never',
	}),
};
</script>

<script lang="ts" setup>
const router = useRouter();

createAppRoute({
	routeTitle: $gettext('Retrieve Login Credentials'),
});

function onSubmitted() {
	router.push({ name: 'auth.forgot-sent' });
}
</script>

<template>
	<div>
		<h2 class="section-header anim-fade-in-enlarge">
			<AppTranslate>Trouble logging in?</AppTranslate>
		</h2>

		<FormRetrieveLogin @submit="onSubmitted" />
	</div>
</template>
