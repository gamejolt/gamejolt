<script lang="ts">
import { PropType } from 'vue';
import { ChatRoom } from '../room';
import { ChatUser } from '../user';
import AppChatList from '../_list/AppChatList.vue';
import AppChatUserListItem from './AppChatUserListItem.vue';
</script>

<script lang="ts" setup>
type UserListEntries = (ChatUser | ChatRoom)[];

defineProps({
	entries: {
		type: Array as PropType<UserListEntries>,
		required: true,
	},
});

function getKeyForEntry(entry: ChatUser | ChatRoom) {
	let key = '';
	if (entry instanceof ChatUser) {
		key = 'chat-user-';
	} else if (entry instanceof ChatRoom) {
		key = 'chat-room-';
	}

	return key + entry.id;
}
</script>

<template>
	<AppChatList :entries="entries">
		<template #default="{ items }: { items: UserListEntries }">
			<AppChatUserListItem
				v-for="entry of items"
				:key="getKeyForEntry(entry)"
				:item="entry"
			/>
		</template>
	</AppChatList>
</template>
