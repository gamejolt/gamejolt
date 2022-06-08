<script lang="ts" setup>
import { PropType } from 'vue';
import { ChatRoom } from '../room';
import { ChatUser } from '../user';
import AppChatList from '../_list/AppChatList.vue';
import AppChatUserListItem from './AppChatUserListItem.vue';

type UserListEntries = (ChatUser | ChatRoom)[];

defineProps({
	entries: {
		type: Array as PropType<UserListEntries>,
		required: true,
	},
});
</script>

<template>
	<AppChatList :entries="entries">
		<template #default="{ item }">
			<AppChatUserListItem :item="item" />
		</template>
	</AppChatList>
</template>
