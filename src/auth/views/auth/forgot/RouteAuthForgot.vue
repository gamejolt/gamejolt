<script lang="ts">
import { defineAppRouteOptions } from '../../../../_common/route/route-component';

export default {
	name: 'RouteAuthForgot',
	...defineAppRouteOptions({
		reloadOn: 'never',
	}),
};
</script>

<script lang="ts" setup>
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { useRouter } from 'vue-router';
import { createAppRoute } from '../../../../_common/route/route-component';
import { $gettext } from '../../../../_common/translate/translate.service';
import FormRetrieveLogin from '../../../components/forms/retrieve-login/FormRetrieveLogin.vue';

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
