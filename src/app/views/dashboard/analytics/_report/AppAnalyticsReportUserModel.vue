<script lang="ts" setup>
import { PropType } from 'vue';
import { RouterLink } from 'vue-router';
import AppUserVerifiedTick from '../../../../../_common/user/AppUserVerifiedTick.vue';
import AppUserAvatarImg from '../../../../../_common/user/user-avatar/AppUserAvatarImg.vue';
import { UserModel } from '../../../../../_common/user/user.model';

defineProps({
	user: {
		type: Object as PropType<UserModel>,
		required: true,
	},
});
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
