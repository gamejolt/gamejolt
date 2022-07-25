<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Api } from '../../api/api.service';
import { Connection } from '../../connection/connection-service';
import { Environment } from '../../environment/environment.service';
import { Navigate } from '../../navigate/navigate.service';
import AppAuthJoinForm, { FormModel } from './join-form.vue';

@Options({
	components: {
		AppAuthJoinForm,
	},
})
export default class AppAuthJoin extends Vue {
	@Prop(Boolean)
	overlay?: boolean;

	blocked = false;

	readonly Connection = Connection;

	async mounted() {
		const response = await Api.sendRequest('/web/auth/check');
		if (response.success && response.blocked) {
			this.blocked = true;
		}
	}

	onJoin(formModel: FormModel) {
		sessionStorage.setItem('signup-auth-token', formModel.token);
		sessionStorage.setItem('signup-username', formModel.username);
		sessionStorage.setItem('signup-password', formModel.password);

		if (GJ_SECTION !== 'auth') {
			Navigate.goto(`${Environment.authBaseUrl}/join/captcha`);
		} else {
			this.$router.push({
				name: 'auth.join-captcha',
			});
		}
	}
}
</script>

<template>
	<div class="auth-join">
		<AppAuthJoinForm :overlay="overlay" :blocked="blocked" @submit="onJoin" />
	</div>
</template>
