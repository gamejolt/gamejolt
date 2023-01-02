<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { Environment } from '../../environment/environment.service';
import { User } from '../user.model';
import AppUserAvatarImg from './AppUserAvatarImg.vue';

const props = defineProps({
	user: {
		type: Object as PropType<User | null | undefined>,
		default: undefined,
	},
	link: {
		type: String,
		default: undefined,
	},
	disableLink: {
		type: Boolean,
	},
});

const { disableLink, user, link } = toRefs(props);

const href = computed(() => {
	if (disableLink.value || !user?.value) {
		return undefined;
	}

	if (!link?.value) {
		return Environment.wttfBaseUrl + user.value.url;
	} else if (link.value === 'dashboard') {
		return Environment.wttfBaseUrl;
	} else if (link.value === 'fireside') {
		return Environment.firesideBaseUrl + '/@' + user.value.username;
	}
});
</script>

<template>
	<component :is="href ? 'a' : 'div'" v-if="user" class="user-avatar" :href="href">
		<AppUserAvatarImg :user="user" />
	</component>
	<AppUserAvatarImg v-else />
</template>

<style lang="stylus" scoped>
.user-avatar
	display: block
	position: relative
</style>
