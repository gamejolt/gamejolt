<script lang="ts" setup>
import { toRef } from 'vue';

import AppChatList from '~app/components/chat/_list/AppChatList.vue';
import AppChatMemberListItem from '~app/components/chat/member-list/AppChatMemberListItem.vue';
import { ChatRoomModel } from '~app/components/chat/room';
import { useChatRoomMembers } from '~app/components/chat/room-channel';

type Props = {
	room: ChatRoomModel;
	hideFilter?: boolean;
	horizontalPadding?: number;
};
const { room, hideFilter = false, horizontalPadding } = defineProps<Props>();

const { memberCollection } = useChatRoomMembers(toRef(() => room));
</script>

<template>
	<AppChatList
		v-if="memberCollection"
		:entries="memberCollection.users"
		:hide-filter="hideFilter"
	>
		<template #default="{ item }">
			<AppChatMemberListItem
				:room="room"
				:user="item"
				:horizontal-padding="horizontalPadding"
			/>
		</template>
	</AppChatList>
</template>
