<script lang="ts">
import { PropType } from 'vue';
import { ChatRoom } from '../room';
import { ChatUser } from '../user';
import AppChatList from '../_list/AppChatList.vue';
import AppChatMemberListItem from './AppChatMemberListItem.vue';
</script>

<script lang="ts" setup>
type MemberListUsers = ChatUser[];

defineProps({
	users: {
		type: Array as PropType<MemberListUsers>,
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
		<template #default="{ items }: { items: MemberListUsers }">
			<AppChatMemberListItem
				v-for="item of items"
				:key="item.id"
				:room="room"
				:user="item"
				:horizontal-padding="horizontalPadding"
			/>
		</template>
	</AppChatList>
</template>
