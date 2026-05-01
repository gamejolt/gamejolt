<script lang="ts" setup>
import { computed } from 'vue';

import { WttfBaseUrl } from '~common/environment/environment.service';
import { UserCommonFields } from '~common/user/user.model';
import AppUserAvatarImg from '~common/user/user-avatar/AppUserAvatarImg.vue';

type Props = {
	user?: UserCommonFields | null;
	disableLink?: boolean;
};
const { user, disableLink = false } = defineProps<Props>();

const href = computed(() => {
	if (disableLink || !user) {
		return undefined;
	}

	return WttfBaseUrl + '/@' + user.username;
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
