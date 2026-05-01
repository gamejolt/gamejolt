<script lang="ts" setup>
import AppUserListItem from '~common/user/list/AppUserListItem.vue';
import { UserModel } from '~common/user/user.model';

type Props = {
	users: UserModel[];
	userHoverCard?: boolean;
};
defineProps<Props>();

const emit = defineEmits<{
	follow: [user: UserModel];
	unfollow: [user: UserModel];
}>();
</script>

<template>
	<div class="user-list">
		<AppUserListItem
			v-for="user of users"
			:key="user.id"
			:user="user"
			:user-hover-card="userHoverCard"
			@follow="emit('follow', user)"
			@unfollow="emit('unfollow', user)"
		/>
	</div>
</template>
