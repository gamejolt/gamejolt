<script lang="ts" setup>
import { PropType } from 'vue';
import AppChatList from '../_list/AppChatList.vue';
import { ChatRoomModel } from '../room';
import { ChatUserCollection } from '../user-collection';
import AppChatMemberListItem from './AppChatMemberListItem.vue';

defineProps({
	collection: {
		type: Object as PropType<ChatUserCollection>,
		required: true,
	},
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
</script>

<template>
	<AppChatList :entries="collection.users" :hide-filter="hideFilter">
		<template #default="{ item }">
			<AppChatMemberListItem
				:room="room"
				:user="item"
				:horizontal-padding="horizontalPadding"
			/>
		</template>
	</AppChatList>
</template>
