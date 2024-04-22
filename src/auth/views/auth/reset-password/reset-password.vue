<script lang="ts">
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { showSuccessGrowl } from '../../../../_common/growls/growls.service';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../_common/route/legacy-route-component';
import FormResetPassword from '../../../components/forms/reset-password/reset-password.vue';

@Options({
	name: 'RouteAuthResetPassword',
	components: {
		FormResetPassword,
	},
})
@OptionsForLegacyRoute({
	reloadOn: 'always',
	// Will return a 404 if the key isn't correct for this user.
	resolver: ({ route }) =>
		Api.sendRequest('/web/auth/check-reset-key/' + route.params.userId, {
			key: route.params.token,
		}),
})
export default class RouteAuthResetPassword extends LegacyRouteComponent {
	get userId() {
		return parseInt(this.$route.params.userId, 10);
	}

	get token() {
		return this.$route.params.token;
	}

	get routeTitle() {
		return this.$gettext('Reset Password');
	}

	onSubmitted() {
		showSuccessGrowl(
			this.$gettext('Your password has been reset. Now you can log in with your new one.'),
			this.$gettext('Password Changed')
		);
		this.$router.push({ name: 'auth.login' });
	}
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
