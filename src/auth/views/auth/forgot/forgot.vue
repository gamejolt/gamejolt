<script lang="ts">
import { Options } from 'vue-property-decorator';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../_common/route/legacy-route-component';
import FormRetrieveLogin from '../../../components/forms/retrieve-login/FormRetrieveLogin.vue';

@Options({
	name: 'RouteAuthForgot',
	components: {
		FormRetrieveLogin,
	},
})
@OptionsForLegacyRoute({
	reloadOn: 'always',
})
export default class RouteAuthForgot extends LegacyRouteComponent {
	get routeTitle() {
		return this.$gettext('Retrieve Login Credentials');
	}

	onSubmitted() {
		this.$router.push({ name: 'auth.forgot-sent' });
	}
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
