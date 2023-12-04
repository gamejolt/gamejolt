<script lang="ts" setup>
import { PropType } from 'vue';
import { UserModel } from '../user.model';
import AppUserListItem from './AppUserListItem.vue';

defineProps({
	users: {
		type: Array as PropType<UserModel[]>,
		required: true,
	},
	eventLabel: {
		type: String,
		default: undefined,
	},
	userHoverCard: {
		type: Boolean,
	},
});

const emit = defineEmits({
	follow: (_user: UserModel) => true,
	unfollow: (_user: UserModel) => true,
});
</script>

<template>
	<div class="user-list">
		<AppUserListItem
			v-for="user of users"
			:key="user.id"
			:user="user"
			:event-label="eventLabel"
			:user-hover-card="userHoverCard"
			@follow="emit('follow', user)"
			@unfollow="emit('unfollow', user)"
		/>
	</div>
</template>
