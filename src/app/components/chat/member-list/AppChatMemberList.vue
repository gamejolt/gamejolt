<script lang="ts" setup>
import { PropType } from 'vue';
import { ChatRoom } from '../room';
import { ChatUser } from '../user';
import AppChatList from '../_list/AppChatList.vue';
import AppChatMemberListItem from './AppChatMemberListItem.vue';

defineProps({
	users: {
		type: Array as PropType<ChatUser[]>,
		required: true,
	},
	room: {
		type: Object as PropType<ChatRoom>,
		required: true,
	},
	hideFilter: {
		type: Boolean,
	},
	horizontalPadding: {
		type: Number,
		default: undefined,
	},
});
</script>

<template>
	<AppChatList :entries="users" :hide-filter="hideFilter">
		<template #default="{ item }">
			<AppChatMemberListItem
				:room="room"
				:user="(item as ChatUser)"
				:horizontal-padding="horizontalPadding"
			/>
		</template>
	</AppChatList>
</template>
