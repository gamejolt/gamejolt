<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Api } from '~common/api/api.service';
import AppAuthJoinForm, { JoinFormModel } from '~common/auth/join/AppAuthJoinForm.vue';
import { AuthBaseUrl } from '~common/environment/environment.service';
import { Navigate } from '~common/navigate/navigate.service';

type Props = {
	overlay?: boolean;
};
const { overlay } = defineProps<Props>();
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
		Navigate.goto(`${AuthBaseUrl}/join/captcha`);
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
