<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { Environment } from '../../environment/environment.service';
import { UserCommonFields } from '../user.model';
import AppUserAvatarImg from './AppUserAvatarImg.vue';

const props = defineProps({
	user: {
		type: Object as PropType<UserCommonFields | null | undefined>,
		default: undefined,
	},
	disableLink: {
		type: Boolean,
	},
});

const { disableLink, user } = toRefs(props);

const href = computed(() => {
	if (disableLink.value || !user?.value) {
		return undefined;
	}

	return Environment.wttfBaseUrl + '/@' + user.value.username;
});
</script>

<template>
	<component
		:is="href ? 'a' : 'div'"
		v-if="user"
		:style="{ display: `block`, position: `relative` }"
		:href="href"
	>
		<AppUserAvatarImg :user="user" />
	</component>
	<AppUserAvatarImg v-else />
</template>
