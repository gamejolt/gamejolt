<script lang="ts" setup>
import { PropType, toRefs } from 'vue';
import AppChatList from '../_list/AppChatList.vue';
import { ChatRoomModel } from '../room';
import { useChatRoomMembers } from '../room-channel';
import AppChatMemberListItem from './AppChatMemberListItem.vue';

const props = defineProps({
	room: {
		type: Object as PropType<ChatRoomModel>,
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

const { room } = toRefs(props);
const { memberCollection } = useChatRoomMembers(room);
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
