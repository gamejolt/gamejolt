<script lang="ts" setup>
import { onMounted, ref, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import { Api } from '../../api/api.service';
import { Environment } from '../../environment/environment.service';
import { Navigate } from '../../navigate/navigate.service';
import AppAuthJoinForm, { JoinFormModel } from './AppAuthJoinForm.vue';

const props = defineProps({
	overlay: {
		type: Boolean,
	},
});

const { overlay } = toRefs(props);
const router = useRouter();

const blocked = ref(false);

onMounted(async () => {
	const response = await Api.sendRequest('/web/auth/check');
	if (response.success && response.blocked) {
		blocked.value = true;
	}
});

function onJoin(formModel: JoinFormModel) {
	sessionStorage.setItem('signup-auth-token', formModel.token);
	sessionStorage.setItem('signup-username', formModel.username);
	sessionStorage.setItem('signup-password', formModel.password);

	if (GJ_SECTION !== 'auth') {
		Navigate.goto(`${Environment.authBaseUrl}/join/captcha`);
	} else {
		router.push({
			name: 'auth.join-captcha',
		});
	}
}
</script>

<template>
	<div class="auth-join">
		<AppAuthJoinForm :overlay="overlay" :blocked="blocked" @submit="onJoin" />
	</div>
</template>
