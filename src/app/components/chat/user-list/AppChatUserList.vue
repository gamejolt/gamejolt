<script lang="ts" setup>
import AppChatList from '../_list/AppChatList.vue';
import { ChatRoomModel } from '../room';
import { ChatUser } from '../user';
import AppChatUserListItem from './AppChatUserListItem.vue';

type UserListEntries = (ChatUser | ChatRoomModel)[];

type Props = {
	entries: UserListEntries;
};
const { entries } = defineProps<Props>();
</script>

<template>
	<AppChatList :entries="entries">
		<template #default="{ item }">
			<AppChatUserListItem :item="item" />
		</template>
	</AppChatList>
</template>
