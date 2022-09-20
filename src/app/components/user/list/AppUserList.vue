<script lang="ts" setup>
import { PropType } from 'vue';
import { User } from '../../../../_common/user/user.model';
import AppUserListItem from './AppUserListItem.vue';

defineProps({
	users: {
		type: Array as PropType<User[]>,
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
	follow: (_user: User) => true,
	unfollow: (_user: User) => true,
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
