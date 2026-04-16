<script lang="ts" setup>
import { toRef } from 'vue';

import AppChatList from '../_list/AppChatList.vue';
import { ChatRoomModel } from '../room';
import { useChatRoomMembers } from '../room-channel';
import AppChatMemberListItem from './AppChatMemberListItem.vue';

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
