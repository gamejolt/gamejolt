<script lang="ts" setup>
import { RouterLink } from 'vue-router';

import AppUserVerifiedTick from '../../../../../_common/user/AppUserVerifiedTick.vue';
import { UserModel } from '../../../../../_common/user/user.model';
import AppUserAvatarImg from '../../../../../_common/user/user-avatar/AppUserAvatarImg.vue';

type Props = {
	user: UserModel;
};
defineProps<Props>();
</script>

<template>
	<RouterLink class="-user-model" :to="user.url">
		<AppUserAvatarImg style="width: 24px" :user="user" />
		<AppUserVerifiedTick :user="user" />
		@{{ user.username }}
	</RouterLink>
</template>

<style lang="stylus" scoped>
.-user-model
	display: flex
	grid-gap: 8px
	flex-direction: row
	align-items: center
</style>
