<script lang="ts" setup>
import AppChatList from '~app/components/chat/_list/AppChatList.vue';
import { ChatRoomModel } from '~app/components/chat/room';
import { ChatUser } from '~app/components/chat/user';
import AppChatUserListItem from '~app/components/chat/user-list/AppChatUserListItem.vue';

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
